from __future__ import annotations

from ..toolRegistry import ToolDef


TOOL_INSERT_BLOCK = ToolDef(
    name="insert-block",
    description="Insert a new code, markdown, or guide block into the notebook at the specified position.",
    parameters={
        "type": "object",
        "properties": {
            "position": {
                "type": "integer",
                "description": "Zero-based index where the block will be inserted. -1 means append at end.",
            },
            "blockType": {
                "type": "string",
                "enum": ["code", "markdown", "guide"],
                "description": "Type of block to insert.",
            },
            "content": {
                "type": "string",
                "description": "Initial content of the block.",
            },
        },
        "required": ["blockType", "content"],
    },
    handler="insertBlock",
)

TOOL_UPDATE_BLOCK = ToolDef(
    name="update-block",
    description="Update the content of an existing block by its ID.",
    parameters={
        "type": "object",
        "properties": {
            "blockId": {
                "type": "string",
                "description": "The ID of the block to update.",
            },
            "content": {
                "type": "string",
                "description": "New content for the block.",
            },
        },
        "required": ["blockId", "content"],
    },
    handler="updateBlock",
)

TOOL_DELETE_BLOCK = ToolDef(
    name="delete-block",
    description="Delete a block from the notebook by its ID.",
    parameters={
        "type": "object",
        "properties": {
            "blockId": {
                "type": "string",
                "description": "The ID of the block to delete.",
            },
        },
        "required": ["blockId"],
    },
    handler="deleteBlock",
)

TOOL_GET_BLOCKS = ToolDef(
    name="get-blocks",
    description="Get the list of all blocks in the current document with their IDs, types, and content.",
    parameters={
        "type": "object",
        "properties": {},
    },
    handler="getBlocks",
)

TOOL_READ_CELLS = ToolDef(
    name="read-cells",
    description="Read learning editor cells by ID, including content, type, execution status, and order.",
    parameters={
        "type": "object",
        "properties": {
            "blockIds": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Optional list of cell/block IDs to read. Omit to read every cell.",
            },
            "includeContent": {
                "type": "boolean",
                "description": "Include full cell content in the response. Defaults to true.",
            },
        },
    },
    handler="readCells",
)

TOOL_WRITE_CELL = ToolDef(
    name="write-cell",
    description="Insert, update, or delete one learning editor cell. Use this for cell-level writes.",
    parameters={
        "type": "object",
        "properties": {
            "operation": {
                "type": "string",
                "enum": ["insert", "update", "delete"],
                "description": "Cell write operation.",
            },
            "blockId": {
                "type": "string",
                "description": "Existing cell ID for update/delete.",
            },
            "position": {
                "type": "integer",
                "description": "Zero-based insertion index. -1 appends.",
            },
            "blockType": {
                "type": "string",
                "enum": ["code", "markdown", "guide", "automation"],
                "description": "New cell type for insert.",
            },
            "content": {
                "type": "string",
                "description": "Cell content for insert/update.",
            },
        },
        "required": ["operation"],
    },
    handler="writeCell",
)

TOOL_CELL_CALL = ToolDef(
    name="cell-call",
    description="Run or check a specific learning cell by ID. Use this for execution/check calls.",
    parameters={
        "type": "object",
        "properties": {
            "operation": {
                "type": "string",
                "enum": ["run", "check"],
                "description": "Run the cell or check it against an expected result.",
            },
            "blockId": {
                "type": "string",
                "description": "Cell/block ID to run or check.",
            },
            "checkType": {
                "type": "string",
                "enum": ["outputMatch", "outputContains", "variableCheck", "codeContains", "noError"],
                "description": "Check strategy when operation is check.",
            },
            "expected": {
                "type": "string",
                "description": "Expected output, variable payload, or required code pattern.",
            },
        },
        "required": ["operation", "blockId"],
    },
    handler="cellCall",
)

TOOL_WRITE_CURRICULUM_YAML = ToolDef(
    name="write-curriculum-yaml",
    description=(
        "Convert a structured Codaro curriculum YAML draft into section-card learning cells and load it into the editor. "
        "For new lessons, use meta, intro, and sections with title/subtitle/goal/why/explanation/tips/snippet/exercise/check; "
        "do not use sections[].blocks unless converting a legacy curriculum."
    ),
    parameters={
        "type": "object",
        "properties": {
            "yamlContent": {
                "type": "string",
                "description": (
                    "Curriculum YAML. Required structured contract for new lessons: "
                    "meta(title,audience,difficulty,packages), intro(direction,benefits,diagram), "
                    "sections[].title/subtitle/goal/why/explanation/tips/snippet/exercise/check. "
                    "Each section becomes one learning card: snippet is the example, "
                    "exercise.prompt/starterCode/solution/hints/check is the learner input cell, and check is validation feedback. "
                    "Use legacy sections[].blocks only for existing legacy curriculum conversion."
                ),
            },
            "category": {
                "type": "string",
                "description": "Curriculum category label for metadata. Defaults to ai.",
            },
            "contentId": {
                "type": "string",
                "description": "Stable curriculum content ID. Defaults to ai-generated.",
            },
            "loadInEditor": {
                "type": "boolean",
                "description": "Load the converted document into the active learning editor. Defaults to true.",
            },
        },
        "required": ["yamlContent"],
    },
    handler="writeCurriculumYaml",
)
