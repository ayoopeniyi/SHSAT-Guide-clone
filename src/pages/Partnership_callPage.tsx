import { useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import {ArrowLeft,Calendar,User,BookOpen,CalendarCheck,Globe,Building,Handshake} from "lucide-react";

interface EventType {
    id: number;
    title: string;
    description?: string;
    length: number;
    slug: string;
}

interface Slot {
    utc_time: string;
    user_time: string;
    user_time_24h: string;
    date: string;
}

interface Attendee {
    id: number;
    email: string;
    name: string;
    timeZone: string;
    phoneNumber?: string;
    locale: string;
    bookingId: number;
    noShow: boolean;
}

interface BookingResponse {
    id: number;
    uid: string;
    start: string;
    end: string;
    user: Record<string, any>;
    attendees: Attendee[];
    location?: any;
    status: string;
    metadata: Record<string, any>;
}

// Auto-detect user's timezone
function getBrowserTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
        return "America/New_York"; 
    }
}

// Get timezone label for display
function getTimezoneLabel(timezone: string): string {
    try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            timeZone: timezone,
            timeZoneName: 'long'
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(now);
        const timezoneName = parts.find(part => part.type === 'timeZoneName')?.value || timezone;
        return `${timezoneName} (${timezone})`;
    } catch (e) {
        return timezone;
    }
}

function getCommonTimezones(userTimezone: string) {
    const commonTimezones = [
        { value: "America/New_York", label: "Eastern Time (ET)" },
        { value: "America/Chicago", label: "Central Time (CT)" },
        { value: "America/Denver", label: "Mountain Time (MT)" },
        { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
        { value: "America/Anchorage", label: "Alaska Time (AKST)" },
        { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
        { value: "Asia/Calcutta", label: "India Standard Time (IST)" },
        { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
        { value: "Europe/Paris", label: "Central European Time (CET)" },
        { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
        { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
    ];
    const filteredTimezones = commonTimezones.filter(tz => tz.value !== userTimezone);
    return [
        { value: userTimezone, label: getTimezoneLabel(userTimezone) },
        ...filteredTimezones
    ];
}

function tomorrowISODate() {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().split("T")[0];
}

function todayISODate() {
    return new Date().toISOString().split("T")[0];
}

function normalizeSlots(raw: any, timezone: string): Slot[] {
    let source: any[] = [];

    if (Array.isArray(raw?.available_slots)) {
        source = raw.available_slots;
    } else if (raw?.slots && typeof raw.slots === "object") {
        for (const date in raw.slots) {
            if (Array.isArray(raw.slots[date])) {
                source.push(...raw.slots[date]);
            }
        }
    } else if (Array.isArray(raw?.slots)) {
        source = raw.slots;
    }

    return source
        .map((s) => {
            const utc =
                s.time ||
                s.utc_time ||
                s.utc ||
                s.start ||
                s.startTime ||
                s.start_time ||
                "";
            if (!utc) return null;
            const d = new Date(utc);
            const displayDate =
                s.date ||
                d.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    timeZone: timezone,
                });
            const displayTime =
                s.user_time ||
                d.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: timezone,
                });
            const displayTime24 =
                s.user_time_24h ||
                d.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: timezone,
                });
            return {
                utc_time: new Date(utc).toISOString(),
                user_time: displayTime,
                user_time_24h: displayTime24,
                date: displayDate,
            } as Slot;
        })
        .filter(Boolean) as Slot[];
}

function formatWithOffset(d: Date, timezone: string): string {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZoneName: "shortOffset"
    });

    const parts = formatter.formatToParts(d);

    const year = parts.find((p) => p.type === "year")?.value || "2023";
    const month = parts.find((p) => p.type === "month")?.value || "01";
    const day = parts.find((p) => p.type === "day")?.value || "01";
    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parts.find((p) => p.type === "minute")?.value || "00";
    const second = parts.find((p) => p.type === "second")?.value || "00";

    const testDate = new Date(d.toLocaleString("en-US", { timeZone: timezone }));
    const utcDate = new Date(
        testDate.toLocaleString("en-US", { timeZone: "UTC" })
    );
    const offsetMs = testDate.getTime() - utcDate.getTime();
    const offsetMinutes = Math.round(offsetMs / 60000);
    const offsetHours = Math.abs(Math.floor(offsetMinutes / 60))
        .toString()
        .padStart(2, "0");
    const offsetMins = Math.abs(offsetMinutes % 60)
        .toString()
        .padStart(2, "0");
    const offsetSign = offsetMinutes >= 0 ? "+" : "-";

    return `${year}-${month}-${day}T${hour}:${minute}:${second}${offsetSign}${offsetHours}:${offsetMins}`;
}

export default function SchedulePartnership() {
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

    const api = useMemo(
        () =>
            axios.create({
                baseURL: API_BASE,
                headers: { "Content-Type": "application/json" },
            }),
        [API_BASE]
    );

    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
    const [fromDate, setFromDate] = useState<string>(todayISODate());
    const [toDate, setToDate] = useState<string>(tomorrowISODate());
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [booking, setBooking] = useState<BookingResponse | null>(null);
    const [bookingMessage, setBookingMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [partnershipType, setPartnershipType] = useState("business");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [company, setCompany] = useState("");
    const [notes, setNotes] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [timezone, setTimezone] = useState<string>(getBrowserTimezone());
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [commonTimezones, setCommonTimezones] = useState<{ value: string, label: string }[]>([]);
    const [showBookingConfirmation, setShowBookingConfirmation] = useState(true);

    useEffect(() => {
  let timer: NodeJS.Timeout;
  
  if (booking && showBookingConfirmation) {
    timer = setTimeout(() => {
      setShowBookingConfirmation(false);
    }, 10000); 
  }
  
  return () => {
    if (timer) clearTimeout(timer);
    setDescription("");
    setTitle("");
  };
}, [booking, showBookingConfirmation]);

    useEffect(() => {
        const userTimezone = getBrowserTimezone();
        setTimezone(userTimezone);
        setCommonTimezones(getCommonTimezones(userTimezone));
    }, []);
    useEffect(() => {
        let mounted = true;
        setLoadingEvents(true);
        setError(null);
        api
            .get("/v1/event-types")
            .then((res) => {
                if (!mounted) return;
                const list: EventType[] = res.data?.event_types || [];
                setEventTypes(list);
                if (
                    list.length &&
                    selectedEvent &&
                    !list.some((e) => e.id === selectedEvent)
                ) {
                    setSelectedEvent(list[0].id);
                } else if (list.length && selectedEvent == null) {
                    setSelectedEvent(list[0].id);
                }
            })
            .catch((err: AxiosError<any>) => {
                if (!mounted) return;
                console.error("Error fetching event types", err);
                setError(
                    err.response?.data?.detail ||
                    "Failed to load partnership types. Check backend URL and CORS."
                );
            })
            .finally(() => mounted && setLoadingEvents(false));
        return () => {
            mounted = false;
        };
    }, [api, selectedEvent]);

    const fetchSlots = async () => {
        if (!selectedEvent || !fromDate || !toDate) return;
        setLoadingSlots(true);
        setError(null);
        setSlots([]);
        setSelectedSlot(null); 
        setShowConfirmation(false);
        try {
            const res = await api.get("/v1/available-slots", {
                params: {
                    event_type_id: selectedEvent,
                    from_date: fromDate,
                    to_date: toDate,
                    timezone: timezone
                },
            });
            const normalized = normalizeSlots(res.data, timezone);
            setSlots(normalized);

            const dates = [...new Set(normalized.map(slot => slot.date))];
            setAvailableDates(dates);

            if (normalized.length === 0) {
                setError("No slots available for the selected date range.");
            } else {
                setActiveStep(2); 
            }
        } catch (err) {
            const e = err as AxiosError<any>;
            console.error("Error fetching slots", e);
            setError(
                e.response?.data?.detail ||
                e.message ||
                "Failed to fetch available slots"
            );
        } finally {
            setLoadingSlots(false);
        }
    };


    const handleSlotSelect = (slot: Slot) => {
        setSelectedSlot(slot);
        setSlots([slot]);
        setActiveStep(3); 
    };

    const confirmBooking = async () => {
        if (!selectedSlot) return;
        await handleBooking(selectedSlot.utc_time);
        setShowConfirmation(false);
    };

    const handleBooking = async (slotISO?: string) => {
        const selectedISO = slotISO || booking?.start || undefined;
        const chosen = selectedISO ?? undefined;
        if (!selectedEvent) {
            setError("Please select a partnership type.");
            return;
        }
        if (!chosen) {
            setError("Please select a time slot.");
            return;
        }
        if (!name || !name.trim()) {
            setError("Please enter your full name.");
            return;
        }
        if (!email || !email.trim()) {
            setError("Please enter your email address.");
            return;
        }
        if (!company || !company.trim()) {
            setError("Please enter your company name.");
            return;
        }
        if (!title || !title.trim()) {
            setError("Please enter a meeting title.");
            return;
        }
        if (!description || !description.trim()) {
            setError("Please enter a meeting description.");
            return;
        }

        setError(null);
        setBookingMessage(null);
        setSubmitting(true);

        try {
            const eventType = eventTypes.find((et) => et.id === selectedEvent);
            const eventLengthMinutes = eventType?.length || 30;

            const start = new Date(chosen);
            const end = new Date(start.getTime() + eventLengthMinutes * 60_000);

            const startISO = formatWithOffset(start, timezone);
            const endISO = formatWithOffset(end, timezone);
            const payload: any = {
                eventTypeId: selectedEvent,
                start: startISO,
                end: endISO,
                name: name.trim(),
                email: email.trim(),
                timeZone: timezone,
                language: "en",
                location: "inPerson",
                title: title.trim(),
                description: description.trim(),
                status: "PENDING",
                metadata: {
                    source: "Partnership Portal",
                    partnership_type: partnershipType,
                    company: company.trim(),
                },
            };
            if (notes && notes.trim()) {
                payload.notes = notes.trim();
            }

            const res = await api.post<BookingResponse>("/v1/schedule", payload);
            setBooking(res.data);
            setActiveStep(4); 

            const userTimezone = res.data.attendees[0]?.timeZone || timezone;
            const displayTime = new Date(res.data.start).toLocaleString("en-US", {
                timeZone: userTimezone,
            });

            setBookingMessage(
                `Booking confirmed for ${displayTime} (${userTimezone}). ID: ${res.data.uid}`
            );
            setSlots([]);
            setSelectedSlot(null);
        } catch (err) {
            const e = err as AxiosError<any>;
            console.error("Error booking slot", e);
            let msg =
                e.response?.data?.detail?.message ||
                e.response?.data?.detail ||
                e.message ||
                "Failed to create booking";
            if (
                e.response?.data?.detail &&
                typeof e.response.data.detail === "object" &&
                e.response.data.detail.suggestions
            ) {
                msg +=
                    "\nAvailable slots: " +
                    e.response.data.detail.suggestions
                        .map((iso: string) =>
                            new Date(iso).toLocaleString("en-US", { timeZone: timezone })
                        )
                        .join(", ");
            }
            setError(`${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    const today = todayISODate();

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-[#377e9a] text-white p-8 relative">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-6 flex items-center text-blue-100 hover:text-white transition-colors duration-200"
                    >
                        <ArrowLeft className="w-6 h-6 mr-1" />
                        <span>Back</span>
                    </button>

                    <div className="text-center pt-4">
                        <div className="flex justify-center mb-3">
                            <Handshake className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">
                            Partnership Meeting Booking
                        </h1>
                        <p className="text-blue-100 opacity-90 max-w-2xl mx-auto">
                            Schedule a meeting with our partnership team to discuss collaboration opportunities,
                            strategic alliances, and business development initiatives.
                        </p>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
                            <div className="flex-shrink-0">
                                <svg
                                    className="w-5 h-5 text-red-500 mt-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-red-800 font-medium">
                                    Please check your input
                                </h3>
                                <div className="mt-1 text-red-700 text-sm">{error}</div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Date Range and Slot Selection */}
                    {activeStep >= 1 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                    <Calendar className="w-5 h-5 text-blue-[#377e9a]" />
                                </div>
                                Select Date Range and Time Slot
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meeting Type
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#377e9a] focus:border-transparent transition-all duration-200 bg-white"
                                        value={selectedEvent ?? ""}
                                        onChange={(e) => setSelectedEvent(Number(e.target.value))}
                                        disabled={loadingEvents}
                                    >
                                        <option value="">Select meeting type</option>
                                        {loadingEvents ? (
                                            <option value="">Loading options...</option>
                                        ) : (
                                            eventTypes.map((et) => (
                                                <option key={et.id} value={et.id}>
                                                    {et.title} ({et.length} minutes)
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        From Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="date"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5d6b] focus:border-transparent transition-all duration-200"
                                            value={fromDate}
                                            min={today}
                                            onChange={(e) => setFromDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        To Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="date"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5d6b] focus:border-transparent transition-all duration-200"
                                            value={toDate}
                                            min={fromDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Timezone Selection */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Timezone
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                    >
                                        {commonTimezones.map((tz) => (
                                            <option key={tz.value} value={tz.value}>
                                                {tz.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    Times will be displayed in your selected timezone
                                </p>
                            </div>

                            <div className="mb-6">
                                <button
                                    onClick={fetchSlots}
                                    disabled={!selectedEvent || !fromDate || !toDate || loadingSlots}
                                    className="w-full bg-[#377e9a] hover:bg-[#1e414b] disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
                                >
                                    {loadingSlots ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Loading Available Slots...
                                        </>
                                    ) : (
                                        <>Check Available Time Slots</>
                                    )}
                                </button>
                            </div>

                            {/* Available Slots */}
                            {slots.length > 0 && !selectedSlot && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Available Time Slots
                                    </h3>

                                    {availableDates.map(date => (
                                        <div key={date} className="mb-6">
                                            <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">
                                                {date}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {slots
                                                    .filter(slot => slot.date === date)
                                                    .map((slot, i) => (
                                                        <button
                                                            key={`${slot.utc_time}-${i}`}
                                                            onClick={() => handleSlotSelect(slot)}
                                                            disabled={submitting}
                                                            className="p-3 border-2 border-gray-200 rounded-lg text-center transition-all duration-200 hover:border-[#2c5d6b] hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Click to select this time slot"
                                                        >
                                                            <div className="font-semibold text-gray-800">
                                                                {slot.user_time}
                                                            </div>
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Partnership Details */}
                    {activeStep >= 2 && selectedSlot && (
                        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                    <BookOpen className="w-5 h-5 text-[#2c5d6b]" />
                                </div>
                                Partnership Details
                            </h2>

                            <div className="mb-5 p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-gray-600">Selected Time:</span>
                                    <span className="font-semibold text-blue-700">
                                        {selectedSlot.date} at {selectedSlot.user_time} (
                                        {commonTimezones.find(tz => tz.value === timezone)?.label || timezone}
                                        )
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Meeting Type:</span>
                                    <span className="font-medium">
                                        {eventTypes.find(et => et.id === selectedEvent)?.title}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meeting Title *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5d6b] focus:border-transparent transition-all duration-200"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Strategic Partnership Discussion"
                                    />
                                </div>


                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Meeting Description *
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5d6b] focus:border-transparent transition-all duration-200"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Brief description of what you'd like to discuss (e.g., 'Exploring opportunities for joint product development and market expansion')"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5d6b] focus:border-transparent transition-all duration-200"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Any special requirements or questions"
                                />
                            </div>

                            {activeStep === 2 && (
                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={() => setActiveStep(1)}
                                        className="text-gray-600 hover:text-gray-800 font-medium py-2.5 px-6 rounded-lg transition-all duration-200 flex items-center"
                                    >
                                        <svg
                                            className="mr-2 w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Back to Time Selection
                                    </button>
                                    <button
                                        onClick={() => setActiveStep(3)}
                                        disabled={!title || !description}
                                        className="bg-[#2c5d6b] hover:bg-[#1e414b] disabled:bg-gray-400 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 flex items-center"
                                    >
                                        Continue to Your Information
                                        <svg
                                            className="ml-2 w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: User Information */}
                    {activeStep >= 3 && selectedSlot && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                Your Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                    />
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company/Organization *
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="Enter your company or organization name"
                                    />
                                </div>
                            </div>

                            {activeStep === 3 && (
                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={() => setActiveStep(2)}
                                        className="text-gray-600 hover:text-gray-800 font-medium py-2.5 px-6 rounded-lg transition-all duration-200 flex items-center"
                                    >
                                        <svg
                                            className="mr-2 w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Back to Partnership Details
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmation(true)}
                                        disabled={!name || !email || !company}
                                        className="bg-[#377e9a] hover:bg-[#1e414b] disabled:bg-gray-400 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 flex items-center"
                                    >
                                        Confirm Booking
                                        <svg
                                            className="ml-2 w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {showConfirmation && selectedSlot && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                    Confirm Booking
                                </h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Organaization Name:</span>
                                        <span className="font-medium">{company}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Session:</span>
                                        <span className="font-medium">
                                            {eventTypes.find((et) => et.id === selectedEvent)?.title}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date & Time:</span>
                                        <span className="font-medium">
                                            {selectedSlot.date} at {selectedSlot.user_time} (
                                            {timezone})
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">
                                            {eventTypes.find((et) => et.id === selectedEvent)?.length}{" "}
                                            minutes
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => setShowConfirmation(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmBooking}
                                        disabled={submitting}
                                        className="bg-[#377e9a] hover:bg-[#2c5d6b] disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 flex items-center"
                                    >
                                        {submitting ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Booking...
                                            </>
                                        ) : (
                                            "Confirm Booking"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Step 4: Booking Confirmation */}
                    {booking && showBookingConfirmation && (
                        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-start mb-3">
                                <div className="bg-green-100 p-2 rounded-lg mr-3">
                                    <CalendarCheck className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-green-800">
                                        Booking Confirmed!
                                    </h2>
                                    <p className="text-green-600 mt-1">
                                        We've sent a confirmation email to {email}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3 mt-4">
                                <div className="flex">
                                    <span className="text-gray-700 font-medium w-32 flex-shrink-0">
                                        Booking ID:
                                    </span>
                                    <span className="font-mono text-blue-600">{booking.uid}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-700 font-medium w-32 flex-shrink-0">
                                        Scheduled Time:
                                    </span>
                                    <span className="text-gray-800">
                                        {new Date(booking.start).toLocaleString("en-US", {
                                            timeZone: booking.attendees[0]?.timeZone || timezone,
                                        })}
                                        {" ("}
                                        {booking.attendees[0]?.timeZone || timezone}
                                        {")"}
                                    </span>
                                </div>
                                {booking.location && (
                                    <div className="flex">
                                        <span className="text-gray-700 font-medium w-32 flex-shrink-0">
                                            Location:
                                        </span>
                                        <span className="text-gray-800">
                                            {typeof booking.location === "object"
                                                ? booking.location.value
                                                : booking.location}
                                        </span>
                                    </div>
                                )}
                                <div className="flex">
                                    <span className="text-gray-700 font-medium w-32 flex-shrink-0">
                                        Status:
                                    </span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-green-200">
                                <p className="text-sm text-green-700">
                                    <strong>Note:</strong> Please check your email for the
                                    calendar invitation and additional details about your SHSAT
                                    consultation session.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
