from types import SimpleNamespace

from codaro.curriculum.catalogFlow import (
    buildCurriculumTaxonomyPayload,
    buildLearningSpecPayload,
)
from codaro.curriculum.taxonomy import CurriculumTaxonomy, DomainDef, OutcomeDef


def testTaxonomyPayloadMapsOutcomeAndDomainModels() -> None:
    taxonomy = CurriculumTaxonomy(
        outcomes=[OutcomeDef(id="python.variables", label="Variables")],
        domains=[
            DomainDef(
                id="dataReporting",
                label="Data reporting",
                targetOutcomes=["python.variables"],
            )
        ],
    )
    curriculumOs = SimpleNamespace(taxonomy=lambda: taxonomy)

    result = buildCurriculumTaxonomyPayload(curriculumOs)

    assert result.outcomeCount == 1
    assert result.domainCount == 1
    assert result.payload["outcomes"][0]["id"] == "python.variables"
    assert result.payload["domains"][0]["id"] == "dataReporting"


def testLearningSpecPayloadExposesTeacherContract() -> None:
    payload = buildLearningSpecPayload()

    assert payload["philosophy"]
    assert payload["exerciseTypes"]
    assert payload["hintStrategy"]
    assert payload["lessonStructure"]
    assert payload["aiTeacherInstructions"]
