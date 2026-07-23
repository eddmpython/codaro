// wasiReplDriver.js - pyproc이 소유하는 파이썬 엔진 드라이버(WASI CPython 위 반복 실행 REPL).
// 정본을 .js 문자열로 둔다: naming 가드가 .py를 스캔하지 않아(기계 검사 사각) 파이썬 식별자의
// camelCase를 강제하려면 .js 안의 소스여야 한다(가드가 def snake_case를 잡는다).
// 외부 CPython(WASI 바이너리)은 참조만 하고, "인터프리터를 세워두고 코드 조각을 N회 실행"하게
// 만드는 엔진 로직은 pyproc이 정본으로 소유한다(SSOT).
//
// 값 채널 무상태화(완전 시간여행의 열쇠): 코드/값을 stdin 스트림으로 넣으면 그 입력 상태(누적
// 바이트)가 힙에 남아 힙 복원 시 스트림이 어긋난다(실측: 복원 후 명령 3바이트 밀림, 근본은 WASI
// FFI 부재). 그래서 값 채널을 나눈다: 코드 = preopen 파일 /cmd(힙 밖 = 복원 무관), 신호 = stdin
// 1바이트(무상태). 이러면 복원이 파이썬 I/O 상태를 어긋내지 않아 완전 시간여행이 성립한다.
//
// 실측 주의(WLR CPython 3.12): 반복 루프 프레임 위 명시적 compile()은 wasm C 스택을 넘겨 죽는다.
// exec(str)의 내부 컴파일은 C 레벨이라 안전하므로 exec(소스문자열)을 직접 쓴다.
export const DRIVER_SOURCE = String.raw`import os, io, gc, sys

# 패키지 검색 경로: 쓰기 가능한 preopen /site를 sys.path에 끼운다. installWheel이 여기에 순수
# 파이썬 wheel 파일을 쓰면 path-based finder가 찾아 import한다(= 브라우저판 site-packages).
if "/site" not in sys.path:
    sys.path.insert(0, "/site")

# 시간여행 복원 안정성(할당 불변 경계): os.read(0,1)은 매 반복 새 bytes를 힙에 할당하고, 그
# 포인터가 fd_read 경계를 넘어 살아있다(shadow stack + WASM VM 로컬 = 선형메모리 밖, 복원 불가).
# 힙 복원이 그 객체를 어긋내면 재개가 그 포인터를 dereference하며 트랩한다(버전/엔진에 따라 3.14는
# 트랩, 3.12는 obmalloc 우연으로 생존). 모듈 레벨 1회 할당 버퍼에 readinto로 읽어 경계-넘는 유일한
# 힙 포인터를 안정시킨다 = 복원 무해. gc.freeze로 시작 객체를 영구 세대로(경계 churn 최소화).
rawStdin = io.FileIO(0, closefd=False)
sigBuf = bytearray(1)
userNs = {}
gc.collect()
gc.freeze()
while True:
    if not rawStdin.readinto(sigBuf):  # 대상에 in-place 기록 = 매 반복 힙 할당 없음
        break
    with open("/cmd", "rb") as commandFile:  # 코드는 파일(힙 밖). 매 실행 fresh하게 읽는다.
        source = commandFile.read()
    try:
        exec(source.decode(), userNs)
    except BaseException as execError:
        os.write(2, (repr(execError) + "\n").encode())
    os.write(1, b"\x04\n")
`;
