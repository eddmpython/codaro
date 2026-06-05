from __future__ import annotations

import pytest
from codaro.automation.vision.capture import Frame, Region


class TestRegion:

    def test_asTuple(self):
        r = Region(x=10, y=20, width=100, height=50)
        assert r.asTuple() == (10, 20, 110, 70)

    def test_values(self):
        r = Region(x=0, y=0, width=1920, height=1080)
        assert r.width == 1920
        assert r.height == 1080


class TestFrame:

    def test_emptyFrame(self):
        f = Frame(data=b"", width=0, height=0, channels=3)
        assert f.size == 0
        assert f.region is None

    def test_frameWithData(self):
        data = b"\x00" * (100 * 100 * 4)
        f = Frame(data=data, width=100, height=100, channels=4)
        assert f.size == 40000
        assert f.width == 100

    def test_frameWithRegion(self):
        r = Region(x=50, y=50, width=200, height=200)
        f = Frame(data=b"\x00", width=200, height=200, channels=3, region=r)
        assert f.region is not None
        assert f.region.x == 50


class TestCaptureFactory:

    def test_unknownBackendRaises(self):
        from codaro.automation.vision.captureFactory import createCapture
        with pytest.raises(RuntimeError, match="No screen capture backend"):
            createCapture(backend="nonexistent")

    def test_mssBackendIfInstalled(self):
        try:
            import mss
        except ImportError:
            pytest.skip("mss not installed")

        from codaro.automation.vision.captureFactory import createCapture
        from codaro.automation.vision.mssCapture import MssCapture
        capture = createCapture(backend="mss")
        assert isinstance(capture, MssCapture)
        capture.dispose()


class TestMssCapture:

    @pytest.fixture
    def skipIfNoMss(self):
        try:
            import mss
        except ImportError:
            pytest.skip("mss not installed")

    def test_fpsStartsAtZero(self, skipIfNoMss):
        from codaro.automation.vision.mssCapture import MssCapture
        capture = MssCapture()
        assert capture.fps() == 0.0
        capture.dispose()

    def test_disposeIdempotent(self, skipIfNoMss):
        from codaro.automation.vision.mssCapture import MssCapture
        capture = MssCapture()
        capture.dispose()
        capture.dispose()
