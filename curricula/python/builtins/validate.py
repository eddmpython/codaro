import re
import yaml
from pathlib import Path

def validateFile(filePath):
    print(f"\n{'='*60}")
    print(f"Multi-Agent Validation: {Path(filePath).name}")
    print(f"{'='*60}\n")

    with open(filePath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Agent 1: Variable Naming
    print("=== Variable Naming Agent ===")
    variables = re.findall(r'^\s+(\w+)\s*=', content, re.MULTILINE)
    varCount = {}
    for var in variables:
        if var in varCount:
            varCount[var] += 1
        else:
            varCount[var] = 1

    duplicates = {k: v for k, v in varCount.items() if v > 1}
    if duplicates:
        print("FAIL: Duplicates found")
        for var, count in duplicates.items():
            print(f"  {var}: {count}x")
    else:
        print(f"PASS: {len(varCount)} unique variables, 0 duplicates")

    # Agent 2: YAML Structure
    print("\n=== YAML Structure Validator ===")
    try:
        data = yaml.safe_load(content)
        print("PASS: Valid YAML syntax")

        practiceSection = None
        for section in data.get('sections', []):
            if section.get('id') == 'practice':
                practiceSection = section
                break

        if practiceSection:
            blocks = practiceSection.get('blocks', [])
            expansions = [b for b in blocks if b.get('type') == 'expansion']
            green = sum(1 for e in expansions if '🟢' in e.get('title', ''))
            yellow = sum(1 for e in expansions if '🟡' in e.get('title', ''))
            red = sum(1 for e in expansions if '🔴' in e.get('title', ''))

            print(f"Practice missions: {len(expansions)} total")
            print(f"  🟢 Green: {green}/5")
            print(f"  🟡 Yellow: {yellow}/5")
            print(f"  🔴 Red: {red}/10")

            if green == 5 and yellow == 5 and red == 10:
                print("PASS: 20 missions (5+5+10)")
            else:
                print("FAIL: Mission count incorrect")
        else:
            print("FAIL: No practice section found")
    except Exception as e:
        print(f"FAIL: {e}")

    # Agent 3: Output Pattern
    print("\n=== Output Pattern Validator ===")
    printCount = len(re.findall(r'\bprint\s*\(', content))
    if printCount == 0:
        print("PASS: No print() statements found")
    else:
        print(f"FAIL: Found {printCount} print() statements")

    # Agent 4: Pyodide Compatibility
    print("\n=== Pyodide Compatibility ===")
    imports = re.findall(r'^\s*(?:import|from)\s+(\w+)', content, re.MULTILINE)
    uniqueImports = set(imports)

    incompatible = {'threading', 'multiprocessing', 'subprocess', 'socket'}
    found = uniqueImports & incompatible

    if found:
        print(f"FAIL: Incompatible modules: {found}")
    else:
        print(f"PASS: All imports Pyodide compatible")
        print(f"  Modules: {uniqueImports}")

    print(f"\n{'='*60}")
    print("VALIDATION COMPLETE")
    print(f"{'='*60}\n")

    return len(duplicates) == 0 and printCount == 0 and not found

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        validateFile(sys.argv[1])
    else:
        print("Usage: python validate.py <yaml_file>")
