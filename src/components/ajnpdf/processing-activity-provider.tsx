"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./processing-activity-provider.module.css";

type Phase =
  | "idle"
  | "preparing"
  | "starting"
  | "processing"
  | "validating"
  | "downloading"
  | "error";

type ActivityState = {
  active: boolean;
  phase: Phase;
  startedAt: number;
  elapsedSeconds: number;
  canCancel: boolean;
  requestLabel: string;
};

const INITIAL_STATE: ActivityState = {
  active: false,
  phase: "idle",
  startedAt: 0,
  elapsedSeconds: 0,
  canCancel: false,
  requestLabel: "document",
};

const SERVER_PATH_PATTERN =
  /\/api\/(?:convert\/|pdf\/(?:protect|unlock|repair|compress)(?:\/|$))/i;

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function getMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.method.toUpperCase();
  }
  return "GET";
}

function isServerProcessingRequest(
  input: RequestInfo | URL,
  init?: RequestInit,
): boolean {
  if (getMethod(input, init) !== "POST") return false;

  try {
    const url = new URL(getRequestUrl(input), window.location.href);
    return SERVER_PATH_PATTERN.test(url.pathname);
  } catch {
    return false;
  }
}

function requestLabelFromUrl(input: RequestInfo | URL): string {
  try {
    const path = new URL(getRequestUrl(input), window.location.href).pathname;
    const tool = path.split("/").filter(Boolean).at(-1) ?? "document";
    return tool.replace(/-/g, " ");
  } catch {
    return "document";
  }
}

function phaseForElapsed(seconds: number): Phase {
  if (seconds < 1) return "preparing";
  if (seconds < 7) return "starting";
  if (seconds < 24) return "processing";
  return "validating";
}

function phaseTitle(phase: Phase): string {
  switch (phase) {
    case "preparing":
      return "Preparing secure processing";
    case "starting":
      return "Starting the document processor";
    case "processing":
      return "Processing your document";
    case "validating":
      return "Finishing and validating the result";
    case "downloading":
      return "Preparing your download";
    case "error":
      return "Processing could not finish";
    default:
      return "Processing";
  }
}

function phaseDescription(phase: Phase): string {
  switch (phase) {
    case "preparing":
      return "Checking the request and preparing a temporary workspace.";
    case "starting":
      return "The secure processor may be waking from an idle state. This is normal on the first request.";
    case "processing":
      return "Your selected operation is running. Keep this tab open until the result is ready.";
    case "validating":
      return "The output is being checked before it is returned to your browser.";
    case "downloading":
      return "Processing finished successfully. Your result is being handed back to the browser.";
    case "error":
      return "The request ended before a valid result was returned. The tool will show the specific error.";
    default:
      return "";
  }
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder.toString().padStart(2, "0")}s`;
}

export function ProcessingActivityProvider() {
  const [activity, setActivity] = useState<ActivityState>(INITIAL_STATE);
  const activeCount = useRef(0);
  const abortController = useRef<AbortController | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = useCallback((phase: "downloading" | "error") => {
    if (revealTimer.current) {
      clearTimeout(revealTimer.current);
      revealTimer.current = null;
    }

    setActivity((current) => {
      if (!current.active) return current;
      return { ...current, phase };
    });

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(
      () => {
        setActivity(INITIAL_STATE);
      },
      phase === "downloading" ? 700 : 1300,
    );
  }, []);

  useEffect(() => {
    if (!activity.active || activity.phase === "downloading" || activity.phase === "error") {
      return;
    }

    const tick = () => {
      setActivity((current) => {
        if (!current.active) return current;
        const elapsedSeconds = Math.max(
          0,
          Math.floor((Date.now() - current.startedAt) / 1000),
        );
        return {
          ...current,
          elapsedSeconds,
          phase: phaseForElapsed(elapsedSeconds),
        };
      });
    };

    tick();
    const timer = window.setInterval(tick, document.hidden ? 2000 : 1000);
    return () => window.clearInterval(timer);
  }, [activity.active, activity.phase]);

  useEffect(() => {
    const backend = process.env.NEXT_PUBLIC_PDF_BACKEND_URL?.trim();
    if (!backend) return;

    try {
      const origin = new URL(backend, window.location.href).origin;
      const existing = document.head.querySelector(
        `link[data-ajn-backend-preconnect="${origin}"]`,
      );
      if (existing) return;

      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = origin;
      link.crossOrigin = "anonymous";
      link.dataset.ajnBackendPreconnect = origin;
      document.head.appendChild(link);

      return () => link.remove();
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    const nativeFetch = window.fetch.bind(window);

    window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      if (!isServerProcessingRequest(input, init)) {
        return nativeFetch(input, init);
      }

      activeCount.current += 1;
      const startedAt = Date.now();
      const requestLabel = requestLabelFromUrl(input);
      let nextInit = init;
      let controller: AbortController | null = null;

      const suppliedSignal =
        init?.signal ??
        (typeof Request !== "undefined" && input instanceof Request
          ? input.signal
          : undefined);

      if (!suppliedSignal) {
        controller = new AbortController();
        abortController.current = controller;
        nextInit = { ...init, signal: controller.signal };
      }

      if (revealTimer.current) clearTimeout(revealTimer.current);
      revealTimer.current = setTimeout(() => {
        setActivity({
          active: true,
          phase: "preparing",
          startedAt,
          elapsedSeconds: 0,
          canCancel: Boolean(controller),
          requestLabel,
        });
      }, 220);

      try {
        const response = await nativeFetch(input, nextInit);

        if (activeCount.current === 1) {
          finish(response.ok ? "downloading" : "error");
        }

        return response;
      } catch (error) {
        if (activeCount.current === 1) finish("error");
        throw error;
      } finally {
        activeCount.current = Math.max(0, activeCount.current - 1);
        if (activeCount.current === 0) abortController.current = null;
      }
    };

    return () => {
      window.fetch = nativeFetch;
      if (revealTimer.current) clearTimeout(revealTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [finish]);

  const cancel = useCallback(() => {
    abortController.current?.abort();
  }, []);

  const stage = useMemo(() => {
    const sequence: Phase[] = [
      "preparing",
      "starting",
      "processing",
      "validating",
      "downloading",
    ];
    const index = sequence.indexOf(activity.phase);
    return Math.max(0, index);
  }, [activity.phase]);

  if (!activity.active) return null;

  return (
    <div className={styles.backdrop}>
      <section
        className={styles.panel}
        role="status"
        aria-live="polite"
        aria-busy={activity.phase !== "error"}
      >
        <div className={styles.topRow}>
          <div>
            <span className={styles.eyebrow}>AJN PDF secure processor</span>
            <h2 className={styles.title}>{phaseTitle(activity.phase)}</h2>
          </div>
          <span className={styles.elapsed}>
            {formatElapsed(activity.elapsedSeconds)}
          </span>
        </div>

        <p className={styles.description}>
          {phaseDescription(activity.phase)}
        </p>

        <div className={styles.progressTrack} aria-hidden="true">
          <div
            className={
              activity.phase === "error"
                ? styles.progressError
                : styles.progressBar
            }
          />
        </div>

        <div className={styles.stages} aria-hidden="true">
          {["Prepare", "Start", "Process", "Validate", "Return"].map(
            (label, index) => (
              <div
                key={label}
                className={`${styles.stage} ${
                  index <= stage ? styles.stageActive : ""
                }`}
              >
                <span className={styles.stageDot} />
                <span>{label}</span>
              </div>
            ),
          )}
        </div>

        <div className={styles.meta}>
          <span className={styles.secureBadge}>Temporary processing</span>
          <span className={styles.jobLabel}>
            {activity.requestLabel}
          </span>
        </div>

        {activity.canCancel &&
          activity.phase !== "downloading" &&
          activity.phase !== "error" && (
            <button className={styles.cancel} type="button" onClick={cancel}>
              Cancel processing
            </button>
          )}
      </section>
    </div>
  );
}
