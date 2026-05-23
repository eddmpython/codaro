from __future__ import annotations

import time
import uuid
from pathlib import Path
from typing import Any


class AutomationToolHandlers:
    async def _handle_httpRequest(self, args: dict[str, Any]) -> dict[str, Any]:
        import urllib.error
        import urllib.request

        method = args["method"]
        url = args["url"]
        headers = args.get("headers", {})
        body = args.get("body")
        timeout = min(args.get("timeout", 30), 60)

        blockedPrefixes = ("file://", "ftp://", "data:")
        if any(url.lower().startswith(p) for p in blockedPrefixes):
            return {"error": f"URL scheme not allowed: {url.split(':')[0]}"}

        try:
            data = body.encode("utf-8") if body else None
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                respBody = resp.read(1024 * 512).decode("utf-8", errors="replace")
                return {
                    "status": resp.status,
                    "headers": dict(resp.headers),
                    "body": respBody,
                    "url": resp.url,
                }
        except urllib.error.HTTPError as exc:
            return {
                "status": exc.code,
                "error": str(exc.reason),
                "body": exc.read(1024 * 64).decode("utf-8", errors="replace"),
            }
        except urllib.error.URLError as exc:
            return {"error": f"Connection failed: {exc.reason}"}
        except TimeoutError:
            return {"error": f"Request timed out after {timeout}s"}

    async def _handle_captureScreen(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.eStop import getEmergencyStop

        getEmergencyStop().check()

        import base64

        from codaro.automation.vision.capture import Region
        from codaro.automation.vision.captureFactory import createCapture

        regionArg = args.get("region")
        region = None
        if regionArg:
            region = Region(
                x=regionArg["x"],
                y=regionArg["y"],
                width=regionArg["width"],
                height=regionArg["height"],
            )

        capture = createCapture()
        try:
            frame = capture.grab(region=region)
        finally:
            capture.dispose()

        if not frame.data:
            return {"error": "Screen capture returned empty frame"}

        import io

        try:
            import numpy as np
            from PIL import Image as PilImage

            array = np.frombuffer(frame.data, dtype=np.uint8)
            if frame.channels == 4:
                array = array.reshape((frame.height, frame.width, 4))
                img = PilImage.fromarray(array[:, :, :3])
            else:
                array = array.reshape((frame.height, frame.width, 3))
                img = PilImage.fromarray(array)

            buf = io.BytesIO()
            imgFormat = args.get("format", "png")
            img.save(buf, format=imgFormat.upper())
            encoded = base64.b64encode(buf.getvalue()).decode("ascii")
        except ImportError:
            encoded = base64.b64encode(frame.data).decode("ascii")
            imgFormat = "raw"

        return {
            "image": f"data:image/{imgFormat};base64,{encoded}",
            "width": frame.width,
            "height": frame.height,
            "format": imgFormat,
        }

    async def _handle_readScreenText(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.eStop import getEmergencyStop

        getEmergencyStop().check()

        from codaro.automation.vision.capture import Region
        from codaro.automation.vision.captureFactory import createCapture

        regionArg = args.get("region")
        region = None
        if regionArg:
            region = Region(
                x=regionArg["x"],
                y=regionArg["y"],
                width=regionArg["width"],
                height=regionArg["height"],
            )

        capture = createCapture()
        try:
            frame = capture.grab(region=region)
        finally:
            capture.dispose()

        if not frame.data:
            return {"error": "Screen capture returned empty frame", "regions": []}

        backend = args.get("backend", "paddle")
        if backend == "easyocr":
            from codaro.automation.vision.easyOcr import EasyOcrEngine

            ocr = EasyOcrEngine()
        else:
            from codaro.automation.vision.paddleOcr import PaddleOcrEngine

            ocr = PaddleOcrEngine()

        try:
            textRegions = ocr.readText(frame)
        finally:
            ocr.dispose()

        return {
            "regions": [r.serialize() for r in textRegions],
            "fullText": " ".join(r.text for r in textRegions),
            "regionCount": len(textRegions),
        }

    def _getInputGuard(self):
        from codaro.automation.shared import getSharedInputGuard

        return getSharedInputGuard()

    async def _handle_clickElement(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.audit import getAuditTrail
        from codaro.automation.eStop import getEmergencyStop

        getEmergencyStop().check()

        guard = self._getInputGuard()
        text = args.get("text")
        button = args.get("button", "left")
        clicks = args.get("clicks", 1)

        if text:
            from codaro.automation.vision.capture import Region
            from codaro.automation.vision.captureFactory import createCapture

            regionArg = args.get("region")
            region = Region(**regionArg) if regionArg else None

            capture = createCapture()
            try:
                frame = capture.grab(region=region)
            finally:
                capture.dispose()

            from codaro.automation.vision.paddleOcr import PaddleOcrEngine

            ocr = PaddleOcrEngine()
            try:
                textRegions = ocr.readText(frame)
            finally:
                ocr.dispose()

            match = None
            for tr in textRegions:
                if text.lower() in tr.text.lower():
                    match = tr
                    break

            if match is None:
                return {"error": f"Element with text '{text}' not found on screen"}

            x = match.x + match.width // 2
            y = match.y + match.height // 2
        else:
            x = args.get("x", 0)
            y = args.get("y", 0)

        guard.click(x, y, button=button, clicks=clicks)
        getAuditTrail().record("click", "ai", {"x": x, "y": y, "button": button, "clicks": clicks})
        return {"clicked": True, "x": x, "y": y, "button": button}

    async def _handle_typeText(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.audit import getAuditTrail
        from codaro.automation.eStop import getEmergencyStop

        getEmergencyStop().check()

        guard = self._getInputGuard()
        text = args["text"]
        interval = args.get("interval", 0.02)

        guard.typeText(text, interval=interval)
        getAuditTrail().record("typeText", "ai", {"textLength": len(text)})
        return {"typed": True, "length": len(text)}

    async def _handle_pressHotkey(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.audit import getAuditTrail
        from codaro.automation.eStop import getEmergencyStop

        getEmergencyStop().check()

        guard = self._getInputGuard()
        keys = args["keys"]

        guard.hotkey(*keys)
        getAuditTrail().record("hotkey", "ai", {"keys": keys})
        return {"pressed": True, "keys": keys}

    async def _handle_findElement(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.eStop import getEmergencyStop

        getEmergencyStop().check()

        text = args["text"]
        regionArg = args.get("region")

        from codaro.automation.vision.capture import Region
        from codaro.automation.vision.captureFactory import createCapture

        region = Region(**regionArg) if regionArg else None

        capture = createCapture()
        try:
            frame = capture.grab(region=region)
        finally:
            capture.dispose()

        from codaro.automation.vision.paddleOcr import PaddleOcrEngine

        ocr = PaddleOcrEngine()
        try:
            textRegions = ocr.readText(frame)
        finally:
            ocr.dispose()

        matches = []
        for tr in textRegions:
            if text.lower() in tr.text.lower():
                matches.append({
                    "text": tr.text,
                    "x": tr.x,
                    "y": tr.y,
                    "width": tr.width,
                    "height": tr.height,
                    "centerX": tr.x + tr.width // 2,
                    "centerY": tr.y + tr.height // 2,
                    "confidence": tr.confidence,
                })

        return {
            "found": len(matches) > 0,
            "matchCount": len(matches),
            "matches": matches,
        }

    async def _handle_waitFor(self, args: dict[str, Any]) -> dict[str, Any]:
        import asyncio

        from codaro.automation.eStop import getEmergencyStop

        text = args["text"]
        timeout = min(args.get("timeout", 10), 60)
        interval = max(args.get("interval", 0.5), 0.2)
        regionArg = args.get("region")

        from codaro.automation.vision.capture import Region
        from codaro.automation.vision.captureFactory import createCapture
        from codaro.automation.vision.paddleOcr import PaddleOcrEngine

        region = Region(**regionArg) if regionArg else None
        deadline = time.monotonic() + timeout

        while time.monotonic() < deadline:
            getEmergencyStop().check()

            capture = createCapture()
            try:
                frame = capture.grab(region=region)
            finally:
                capture.dispose()

            ocr = PaddleOcrEngine()
            try:
                textRegions = ocr.readText(frame)
            finally:
                ocr.dispose()

            for tr in textRegions:
                if text.lower() in tr.text.lower():
                    return {
                        "found": True,
                        "text": tr.text,
                        "x": tr.x + tr.width // 2,
                        "y": tr.y + tr.height // 2,
                        "elapsed": timeout - (deadline - time.monotonic()),
                    }

            await asyncio.sleep(interval)

        return {"found": False, "timeout": timeout, "text": text}

    def _getRecorder(self):
        from codaro.automation.shared import getSharedRecorder

        return getSharedRecorder()

    async def _handle_startRecording(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.audit import getAuditTrail
        from codaro.automation.eStop import getEmergencyStop

        getEmergencyStop().check()

        recorder = self._getRecorder()
        recordingId = recorder.start()
        getAuditTrail().record("startRecording", "ai", {"recordingId": recordingId})
        return {"recordingId": recordingId, "status": "recording"}

    async def _handle_stopRecording(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.audit import getAuditTrail
        from codaro.automation.recorder.recipeGenerator import RecipeGenerator

        recorder = self._getRecorder()
        actions = recorder.stop()
        title = args.get("title", "Recorded Automation")

        generator = RecipeGenerator()
        recipe = generator.generate(actions, title=title)

        outputPath = args.get("outputPath")
        saved = False
        if outputPath and self._workspaceRoot:
            filePath = self._validatePath(outputPath)
            Path(filePath).write_text(recipe, encoding="utf-8")
            saved = True

        getAuditTrail().record("stopRecording", "ai", {
            "recordingId": recorder.recordingId,
            "actionCount": len(actions),
            "saved": saved,
        })

        recorder.reset()

        return {
            "actionCount": len(actions),
            "recipe": recipe if not saved else None,
            "path": outputPath if saved else None,
            "saved": saved,
        }

    async def _handle_writeAutomationRecipe(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.recipeAuthoring import buildAutomationRecipeDraft

        try:
            draft = buildAutomationRecipeDraft(
                title=str(args.get("title", "")),
                code=str(args.get("code", "")),
                description=str(args.get("description", "")),
                dryRunFirst=args.get("dryRunFirst", True) is not False,
            )
        except ValueError as exc:
            return {"error": str(exc)}
        loadInEditor = args.get("loadInEditor", True) is not False

        outputPath = args.get("outputPath")
        if not outputPath and self._workspaceRoot:
            outputPath = draft.outputPath

        saved = False
        savedPath: str | None = None
        if outputPath and self._workspaceRoot:
            filePath = Path(self._validatePath(str(outputPath)))
            try:
                filePath.parent.mkdir(parents=True, exist_ok=True)
                filePath.write_text(draft.recipe, encoding="utf-8")
            except OSError as exc:
                return {"error": f"Failed to write automation recipe: {exc}"}
            saved = True
            savedPath = str(filePath)

        loadedInEditor = False
        blockId: str | None = None
        if loadInEditor:
            from codaro.document.models import BlockConfig

            doc = self._getDocument()
            blockId = f"automation-{uuid.uuid4().hex[:8]}"
            doc.blocks.append(BlockConfig(
                id=blockId,
                type="automation",
                role="automation",
                executionKind="python",
                displayKind="cell",
                sourceType="automationAuthoring",
                title=draft.title,
                description=draft.description,
                content=draft.automationBody,
                payload={
                    "recipePath": savedPath,
                    "dryRunFirst": draft.dryRunFirst,
                    "authoringTool": "write-automation-recipe",
                },
            ))
            self._saveDocument(doc)
            loadedInEditor = self._documentSetter is not None

        return {
            "saved": saved,
            "path": savedPath,
            "loadedInEditor": loadedInEditor,
            "blockId": blockId,
            "dryRunFirst": draft.dryRunFirst,
            "recipe": None if saved else draft.recipe,
        }

    async def _handle_createAutomationTask(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.recipeAuthoring import buildAutomationTaskDraft
        from codaro.automation.taskRegistry import getTaskRegistry

        try:
            draft = buildAutomationTaskDraft(
                name=str(args.get("name", "")),
                documentPath=str(args.get("documentPath", "")),
                description=str(args.get("description", "")),
                schedule=str(args["schedule"]) if args.get("schedule") else None,
                inputs=args.get("inputs"),
            )
        except (TypeError, ValueError) as exc:
            return {"error": str(exc)}

        recipePath = Path(self._validatePath(draft.documentPath))
        if not recipePath.is_file():
            return {"error": f"Automation recipe not found: {draft.documentPath}"}

        task = getTaskRegistry().create(
            name=draft.name,
            documentPath=str(recipePath),
            description=draft.description,
            schedule=draft.schedule,
            inputs=draft.inputs,
        )
        return {
            "created": True,
            "task": task.serialize(),
            "documentPath": str(recipePath),
        }

    async def _handle_runAutomation(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.eStop import getEmergencyStop
        from codaro.automation.loop.automationLoop import AutomationLoop, LoopConfig

        getEmergencyStop().check()

        steps = args["steps"]
        maxFails = args.get("maxConsecutiveFailures", 3)

        config = LoopConfig(maxConsecutiveFailures=maxFails)

        async def actionHandler(action: str, params: dict[str, Any]) -> dict[str, Any]:
            return await self.execute(action, params)

        async def verificationHandler(text: str, params: dict[str, Any]) -> bool:
            result = await self.execute("find-element", {"text": text})
            return result.get("found", False)

        loop = AutomationLoop(
            actionHandler=actionHandler,
            verificationHandler=verificationHandler,
            config=config,
        )

        for s in steps:
            loop.addStep(
                action=s["action"],
                parameters=s.get("parameters", {}),
                verification=s.get("verification"),
                maxRetries=s.get("maxRetries", 2),
            )

        result = await loop.run()
        return result

    async def _handle_detectElements(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.eStop import getEmergencyStop

        getEmergencyStop().check()

        from codaro.automation.vision.capture import Region
        from codaro.automation.vision.captureFactory import createCapture
        from codaro.automation.vision.elementDetector import ElementDetector

        regionArg = args.get("region")
        region = Region(**regionArg) if regionArg else None

        capture = createCapture()
        try:
            frame = capture.grab(region=region)
        finally:
            capture.dispose()

        if not frame.data:
            return {"error": "Empty frame", "elements": []}

        detector = ElementDetector()
        methods = args.get("methods", ["all"])
        searchText = args.get("text")

        elements = []
        try:
            if "all" in methods:
                elements = detector.detectAll(frame, searchText=searchText)
            else:
                if "ocr" in methods:
                    elements.extend(detector.detectByOcr(frame, searchText=searchText))
                if "contour" in methods:
                    elements.extend(detector.detectByContour(frame))
        finally:
            detector.dispose()

        return {
            "elementCount": len(elements),
            "elements": [e.serialize() for e in elements[:50]],
        }

    async def _handle_voiceListen(self, args: dict[str, Any]) -> dict[str, Any]:
        import asyncio

        from codaro.automation.eStop import getEmergencyStop

        getEmergencyStop().check()

        duration = min(args.get("duration", 5), 30)
        language = args.get("language", "en")

        from codaro.automation.voice.whisperEngine import WhisperEngine

        engine = WhisperEngine()
        try:
            engine.startListening(language=language)
            await asyncio.sleep(duration)
            result = engine.stopListening()
        finally:
            engine.dispose()

        if result is None:
            return {"error": "No audio captured", "text": ""}

        return result.serialize()

    async def _handle_voiceSpeak(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.eStop import getEmergencyStop

        getEmergencyStop().check()

        text = args["text"]
        rate = args.get("rate", 150)

        from codaro.automation.voice.pyttsx3Speaker import Pyttsx3Speaker

        speaker = Pyttsx3Speaker()
        try:
            speaker.speak(text, rate=rate)
        finally:
            speaker.dispose()

        return {"spoken": True, "text": text, "rate": rate}

    async def _handle_sendNotification(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.audit import getAuditTrail
        from codaro.automation.eStop import getEmergencyStop

        getEmergencyStop().check()

        channel = args["channel"]
        message = args["message"]

        from codaro.automation.shared import getSharedMessageBridge

        bridge = getSharedMessageBridge()

        if channel == "all":
            results = bridge.broadcast(message)
            getAuditTrail().record("sendNotification", "ai", {"channel": "all", "resultCount": len(results)})
            return {
                "broadcast": True,
                "results": [r.serialize() for r in results],
            }

        result = bridge.send(channel, message)
        getAuditTrail().record("sendNotification", "ai", {"channel": channel, "success": result.success})
        return result.serialize()

    async def _handle_emergencyStop(self, args: dict[str, Any]) -> dict[str, Any]:
        from codaro.automation.eStop import getEmergencyStop

        reason = args.get("reason", "AI triggered emergency stop")
        eStop = getEmergencyStop()
        triggered = eStop.trigger(reason)
        return {
            "triggered": triggered,
            "reason": reason,
            "status": eStop.serialize(),
        }
