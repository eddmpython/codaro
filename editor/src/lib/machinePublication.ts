import contract from "@/lib/generatedContracts/machinePublication.v1.json";

export function machinePublicationState(pathId: string): "candidate" | "golden" | "unavailable" {
  const row = contract.paths.find((item) => item.pathId === pathId);
  return row?.publicationState === "golden" ? "golden" : "unavailable";
}
