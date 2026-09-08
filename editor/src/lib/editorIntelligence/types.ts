// Source: codaro.document.codeIntelligence. Rebuild with genProductContracts.py.

export type AnalysisOperation = "complete" | "definition" | "references" | "rename" | "hover" | "signature" | "diagnostics";

export type EditorFile = {
    path: string;
    source: string;
};

export type EditorLocation = {
    path: string;
    line: number;
    from: number;
    to: number;
    name: string;
};

export type EditorEdit = {
    path: string;
    line: number;
    from: number;
    to: number;
    name: string;
    text: string;
};

export type AnalysisItem = {
    label?: string;
    insertText?: string;
    kind?: string;
    detail?: string;
    name?: string;
    description?: string;
    documentation?: string;
};

export type AnalysisSignature = {
    label: string;
    activeParameter: number | null;
    parameters: Array<string>;
};

export type AnalysisDiagnostic = {
    line: number;
    from: number;
    message: string;
    severity: "error";
};

export type AnalysisResponse = {
    version: string;
    operation: "complete" | "definition" | "references" | "rename" | "hover" | "signature" | "diagnostics";
    locations?: Array<EditorLocation>;
    edits?: Array<EditorEdit>;
    items?: Array<AnalysisItem>;
    signatures?: Array<AnalysisSignature>;
    diagnostics?: Array<AnalysisDiagnostic>;
};

export type RepairChange = {
    from: number;
    to: number;
    before: string;
    after: string;
};

export type RepairProposal = {
    version: string;
    blockId: string;
    source: string;
    changes: Array<RepairChange>;
    explanation: string;
    provider: string;
    model: string;
};
