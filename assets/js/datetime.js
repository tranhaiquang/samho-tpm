/**
 * SAMHO_DATETIME — shared local-time datetime layer.
 *
 * Replaces the four hand-rolled parsers (app_edited, repair_info_edited,
 * kpi_dashboard_edited, pm_edited), the two DB write helpers, the three
 * display dialects, and the two getDowntimeMinutes copies.
 *
 * Zero dependencies, pure in-process computation. Local-time only: every
 * constructor and getter is local-time; toISOString()/Date.UTC are NEVER
 * used in the output path (avoids the DST/midnight day-shift bug).
 *
 * Primary path (breakdown repair workflow) is zero-option; secondary
 * consumers (PM, KPI, red-tag) use the explicit verbs below.
 */
(function () {
  "use strict";

  const pad2 = (n) => String(n).padStart(2, "0");
  const normYear = (y) => (String(y).length === 2 ? 2000 + Number(y) : Number(y));

  const ISO = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
  const DAYFIRST = /^(\d{1,2})-(\d{1,2})-(\d{2,4})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
  const COMPACT = /^(\d{4})(\d{2})(\d{2})$/;
  const TIME = /^(\d{1,2}):(\d{2})$/;

  const parse = (value) => {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (value == null || value === "") return null;
    const text = String(value).trim();
    if (!text) return null;

    let m = text.match(ISO);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));

    m = text.match(DAYFIRST);
    if (m) return new Date(normYear(m[3]), +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));

    m = text.match(COMPACT);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);

    const d = new Date(text);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatParts = (date, { dayFirst, year4, withTime, sep = "-" }) => {
    const yyyy = date.getFullYear();
    const mm = pad2(date.getMonth() + 1);
    const dd = pad2(date.getDate());
    const yy = year4 ? yyyy : String(yyyy).slice(-2);
    const dateBit = dayFirst ? `${dd}${sep}${mm}${sep}${yy}` : `${mm}${sep}${dd}${sep}${yyyy}`;
    return withTime ? `${dateBit} ${pad2(date.getHours())}:${pad2(date.getMinutes())}` : dateBit;
  };

  const applyTime = (date, timeValue) => {
    if (!timeValue) return date;
    const m = String(timeValue).trim().match(TIME);
    if (m) date.setHours(+m[1], +m[2], 0, 0);
    return date;
  };

  window.SAMHO_DATETIME = {
    /**
     * Parse any supported dialect into a local-time Date (null when unparseable).
     * Accepts: Date, ISO datetime/date, day-first "d-m-yyyy"/"d-m-yy" (± time),
     * compact "yyyymmdd", or native Date string.
     */
    parse,

    /**
     * Encode <input type="date"> value ("YYYY-MM-DD") + <input type="time">
     * value ("HH:mm") to the DB dialect "dd-mm-yy hh:mm".
     * Returns "" when the date is missing/empty; date-only "dd-mm-yy" when
     * only the time is missing.
     */
    fromInput(dateValue, timeValue) {
      const date = parse(dateValue);
      if (!date) return "";
      applyTime(date, timeValue);
      return formatParts(date, { dayFirst: true, year4: false, withTime: !!timeValue });
    },

    /**
     * DOM form of fromInput. Returns "" when either input is empty/absent.
     */
    readInput(dateId, timeId) {
      const date = document.getElementById(dateId)?.value || "";
      const time = document.getElementById(timeId)?.value || "";
      if (!date || !time) return "";
      return this.fromInput(date, time);
    },

    /**
     * Display dialect for the repair workflow: "dd/mm/yyyy hh:mm".
     * Unparseable values pass through as trimmed text with "T"→space, 16 chars.
     */
    toDisplay(value) {
      if (value == null || value === "") return "";
      const date = parse(value);
      if (!date) return String(value).trim().replace("T", " ").slice(0, 16);
      return formatParts(date, { dayFirst: true, year4: true, withTime: true, sep: "/" });
    },

    /**
     * Downtime in whole minutes, clamped >= 0. null when either side unparseable.
     */
    downtimeMinutes(startValue, endValue) {
      const start = parse(startValue);
      const end = parse(endValue);
      if (!start || !end) return null;
      return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    },

    /**
     * Split any parseable value into input-ready {date, time} strings.
     */
    toInput(value) {
      const date = parse(value);
      if (!date) return { date: "", time: "" };
      return { date: this.toInputDate(date), time: this.toInputTime(date) };
    },

    /**
     * DOM form of toInput; no-op when either element is missing.
     */
    setInputs(value, dateId, timeId) {
      const parts = this.toInput(value);
      const d = document.getElementById(dateId);
      const t = document.getElementById(timeId);
      if (d) d.value = parts.date;
      if (t) t.value = parts.time;
    },

    /**
     * Month-first, date-only display (PM + red-tag dialect): "mm/dd/yyyy".
     */
    formatDate(value) {
      if (value == null || value === "") return "";
      const date = parse(value);
      if (!date) return String(value).trim();
      return formatParts(date, { dayFirst: false, year4: true, withTime: false, sep: "/" });
    },

    /**
     * KPI grouping key: "yyyy-mm". "" when unparseable.
     */
    monthKey(value) {
      const date = parse(value);
      if (!date) return "";
      return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
    },

    /**
     * DST-safe date shift returning canonical ISO "yyyy-mm-dd".
     */
    addDays(value, days) {
      const date = parse(value) || new Date();
      date.setDate(date.getDate() + days);
      return this.toInputDate(date);
    },

    /**
     * Local "now" for input stamping: {date, time} — never UTC.
     */
    now() {
      const now = new Date();
      return { date: this.toInputDate(now), time: this.toInputTime(now) };
    },

    /** @returns {string} "YYYY-MM-DD" (local getters, never toISOString) */
    toInputDate(date) {
      if (!(date instanceof Date)) date = parse(date);
      if (!date) return "";
      return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
    },

    /** @returns {string} "HH:mm" (local getters) */
    toInputTime(date) {
      if (!(date instanceof Date)) date = parse(date);
      if (!date) return "";
      return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    }
  };
})();
