
import logging
import time

import requests

from config import MYMEMORY_LANG_PAIR
from services import errors

logger = logging.getLogger(__name__)

MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get"
MYMEMORY_MAX_CHARS_PER_REQUEST = 500
MYMEMORY_TIMEOUT_SECONDS = 15
MYMEMORY_RETRY_ATTEMPTS = 2


class TranslatorError(errors.BackendError):
    """Raised when a translation cannot be produced for a language."""


class MyMemoryTranslator:
    name = "MyMemory"

    def __init__(self):
        self._session = requests.Session()

    def _lang_pair(self, source, target):
        src = MYMEMORY_LANG_PAIR.get(source, source)
        tgt = MYMEMORY_LANG_PAIR.get(target, target)
        return f"{src}|{tgt}"

    def translate(self, text, source, target):
        if not text or not text.strip():
            return text

        pair = self._lang_pair(source, target)
        last_err = None

        for attempt in range(1, MYMEMORY_RETRY_ATTEMPTS + 1):
            try:
                resp = self._session.post(
                    MYMEMORY_ENDPOINT,
                    data={"q": text, "langpair": pair},
                    timeout=MYMEMORY_TIMEOUT_SECONDS,
                )
                resp.raise_for_status()
                payload = resp.json()

                status = payload.get("responseStatus")
                if status != 200:
                    last_err = (
                        f"MyMemory responded with status {status}: "
                        f"{payload.get('responseDetails')}"
                    )
                    raise TranslatorError(last_err)

                translated = (
                    payload.get("responseData", {}).get("translatedText") or ""
                ).strip()
                if not translated:
                    last_err = "MyMemory returned an empty translation."
                    raise TranslatorError(last_err)

                return translated

            except TranslatorError:
                # Retry transient failures before giving up.
                last_err = f"attempt {attempt}: {last_err}"
                if attempt < MYMEMORY_RETRY_ATTEMPTS:
                    time.sleep(1)
            except (requests.RequestException, ValueError) as exc:
                last_err = f"attempt {attempt}: {exc}"
                if attempt < MYMEMORY_RETRY_ATTEMPTS:
                    time.sleep(1)

        raise TranslatorError(f"{self.name} unavailable: {last_err}")


def get_translator():
    return MyMemoryTranslator()
