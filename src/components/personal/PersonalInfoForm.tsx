import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  MapPin,
  Globe,
  CalendarDays,
  Mail,
  Phone,
  Camera,
  Pencil,
  Gem,
  Fingerprint,
  Contact,
  IdCard,
  Info,
  Lock,
  Check,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import useUserStore from "@/store/userStore";
import { countries } from "@/data/countries";
import { useEffect } from "react";
import { AxiosError } from "axios";

// ── Schema (UNCHANGED, moved verbatim) ────────────────────────────
const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  country: z.string().min(1, "Please select a country"),
  birth_date: z.string().min(1, "Date of birth is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(5, "Phone number must be at least 5 characters"),
  avatar: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface PersonalInfoFormProps {
  /** Show the Profile hero header. Default: true. */
  showProfilePhoto?: boolean;
  /** Custom submit button label. Default: "Save Changes". */
  submitLabel?: string;
  /** Optional callback fired after a successful POST /update. */
  onSuccess?: () => void;
}

export function PersonalInfoForm({
  showProfilePhoto = true,
  submitLabel = "Save Changes",
  onSuccess,
}: PersonalInfoFormProps) {
  // ── State (UNCHANGED) ──
  const [image, setImage] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const user = useUserStore((state) => state.user);

  // ── Form setup (UNCHANGED) ──
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      address: user?.address || "",
      country: user?.country || "maldives",
      birth_date: user?.birth_date || "",
      email: user?.email || "",
      phone: user?.phone || "",
      avatar: user?.avatar || null,
    },
  });

  useEffect(() => {
    if (user) {
      setImage(user?.avatar || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Submit handler (UNCHANGED) ──
  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/update", {
        ...data,
        avatar: image,
      });

      if (response.data) {
        toast.success("Profile updated successfully");
        if (user) {
          useUserStore.getState().setUser(
            {
              ...user,
              first_name: data.first_name,
              last_name: data.last_name,
              country: data.country,
              birth_date: data.birth_date,
              email: data.email,
              address: data.address,
              phone: data.phone,
              avatar: image || user.avatar,
            },
            useUserStore.getState().token!
          );
        }
        onSuccess?.();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      const errorMessage =
        (error as AxiosError<{ message: string }>).response?.data?.message ||
        "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const imageData = event.target.result as string;
            setImage(imageData);
            setValue("avatar", imageData);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      handleImageUpload((e.target as HTMLInputElement).files);
    };
    input.click();
  };

  // ── Live completion ring (visual only) ──
  const watched = watch();
  const completionFields: (keyof FormValues)[] = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "country",
    "address",
    "birth_date",
  ];
  const filled =
    completionFields.filter((k) => {
      const v = watched[k];
      return v !== undefined && v !== null && String(v).trim().length > 0;
    }).length + (image ? 1 : 0);
  const total = 8;
  const percent = Math.round((filled / total) * 100);
  const ringRadius = 28;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ((100 - percent) / 100) * ringCirc;
  const ringColor =
    percent === 100 ? "#00dfa2" : percent >= 50 ? "#FF9800" : "#f43f5e";

  const initials =
    `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() ||
    "UA";
  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    "user account";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-[18px]"
    >
      {/* ─── Profile Hero (.prof-hero) ─── */}
      {showProfilePhoto && (
        <div
          className={`relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-white/[0.06] p-7 sm:flex-row ${
            isDragging ? "ring-2 ring-[#00dfa2]/40" : ""
          }`}
          style={{
            background:
              "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(175deg,rgba(255,255,255,0.025),transparent 40%)",
            }}
          />

          {/* Avatar */}
          <div className="relative z-10 shrink-0">
            <button
              type="button"
              onClick={handleClick}
              aria-label="Upload profile photo"
              className="group relative grid h-[88px] w-[88px] place-items-center overflow-hidden rounded-full transition-shadow hover:shadow-[0_0_24px_rgba(0,223,162,0.15)]"
              style={{
                background:
                  "linear-gradient(135deg,rgba(0,223,162,0.18),rgba(0,223,162,0.12))",
                border: "2px solid rgba(0,223,162,0.15)",
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-[Outfit,sans-serif] text-[1.6rem] font-black text-[#00dfa2]">
                  {initials}
                </span>
              )}
              <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex flex-col items-center gap-1 text-white">
                  <Camera className="h-[0.9rem] w-[0.9rem]" />
                  <span className="text-[0.55rem] font-semibold uppercase tracking-[0.04em] text-white/70">
                    Upload
                  </span>
                </span>
              </span>
            </button>
            <span
              className="absolute -bottom-[2px] -right-[2px] grid h-6 w-6 place-items-center rounded-full"
              style={{
                background: "linear-gradient(135deg,#00dfa2,#00b881)",
                border: "2.5px solid #0a0d15",
              }}
            >
              <Pencil className="h-[0.55rem] w-[0.55rem] text-[#07080c]" />
            </span>
          </div>

          {/* Identity */}
          <div className="relative z-10 min-w-0 flex-1 text-center sm:text-left">
            <div className="truncate font-[Outfit,sans-serif] text-[1.25rem] font-extrabold text-[#eef2f7]">
              {fullName}
            </div>
            <div className="mt-px truncate text-[0.78rem] text-[#4a5468]">
              {user?.email || "—"}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.03em]"
                style={{
                  background: "rgba(0,223,162,0.08)",
                  color: "#00dfa2",
                  border: "1px solid rgba(0,223,162,0.12)",
                }}
              >
                <Gem className="h-[0.55rem] w-[0.55rem]" />
                {user?.account_type?.title || "Basic Plan"}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.03em]"
                style={{
                  background: "rgba(255,255,255,0.035)",
                  color: "#8b97a8",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Fingerprint className="h-[0.55rem] w-[0.55rem]" />
                <code className="font-[JetBrains_Mono,monospace] font-semibold">
                  {user?.account_id || "—"}
                </code>
              </span>
            </div>
          </div>

          {/* Completion ring (visual) */}
          <div className="relative z-10 flex shrink-0 flex-col items-center gap-1.5">
            <div className="relative h-16 w-16">
              <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="rgba(255,255,255,0.035)"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke={ringColor}
                  strokeDasharray={ringCirc.toFixed(2)}
                  strokeDashoffset={ringOffset.toFixed(2)}
                  style={{ transition: "stroke-dashoffset .6s ease" }}
                />
              </svg>
              <div
                className="absolute inset-0 grid place-items-center font-[JetBrains_Mono,monospace] text-[0.82rem] font-extrabold"
                style={{ color: ringColor }}
              >
                {percent}%
              </div>
            </div>
            <span className="text-[0.55rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
              Complete
            </span>
          </div>
        </div>
      )}

      {/* ─── Personal Information ─── */}
      <FormSection
        icon={<User className="h-3 w-3" />}
        title="Personal Information"
        description="Basic identity details"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldGroup
            label="First Name"
            icon={<User className="h-3 w-3" />}
            error={errors.first_name?.message}
          >
            <Input
              id="first_name"
              {...register("first_name")}
              className="input-focus-glow h-10 rounded-lg border-white/[0.06] text-[0.84rem] !bg-[rgba(255,255,255,0.035)] text-[#eef2f7] placeholder:text-[#3a4556] focus:border-[#00dfa2]"
            />
          </FieldGroup>

          <FieldGroup
            label="Last Name"
            icon={<User className="h-3 w-3" />}
            error={errors.last_name?.message}
          >
            <Input
              id="last_name"
              {...register("last_name")}
              className="input-focus-glow h-10 rounded-lg border-white/[0.06] text-[0.84rem] !bg-[rgba(255,255,255,0.035)] text-[#eef2f7] placeholder:text-[#3a4556] focus:border-[#00dfa2]"
            />
          </FieldGroup>

          <FieldGroup
            label="Date of Birth"
            icon={<CalendarDays className="h-3 w-3" />}
            error={errors.birth_date?.message}
          >
            <Input
              id="birth_date"
              type="date"
              {...register("birth_date")}
              className="input-focus-glow h-10 rounded-lg border-white/[0.06] text-[0.84rem] !bg-[rgba(255,255,255,0.035)] text-[#eef2f7] placeholder:text-[#3a4556] focus:border-[#00dfa2] [color-scheme:dark]"
            />
          </FieldGroup>

          <FieldGroup
            label="Gender"
            icon={<User className="h-3 w-3" />}
            hint="Visual-only — not posted"
          >
            <select
              defaultValue="Prefer not to say"
              className="input-focus-glow h-10 w-full rounded-lg border border-white/[0.06] bg-[rgba(255,255,255,0.035)] px-3 text-[0.84rem] text-[#eef2f7] focus:border-[#00dfa2] focus:outline-none"
            >
              <option>Prefer not to say</option>
              <option>Male</option>
              <option>Female</option>
              <option>Non-binary</option>
            </select>
          </FieldGroup>
        </div>
      </FormSection>

      {/* ─── Contact Information ─── */}
      <FormSection
        icon={<Contact className="h-3 w-3" />}
        title="Contact Information"
        description="How we reach you"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldGroup
            label="Email Address"
            icon={<Mail className="h-3 w-3" />}
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="input-focus-glow h-10 rounded-lg border-white/[0.06] text-[0.84rem] !bg-[rgba(255,255,255,0.035)] text-[#eef2f7] placeholder:text-[#3a4556] focus:border-[#00dfa2]"
            />
          </FieldGroup>

          <FieldGroup
            label="Phone Number"
            icon={<Phone className="h-3 w-3" />}
            error={errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              className="input-focus-glow h-10 rounded-lg border-white/[0.06] text-[0.84rem] !bg-[rgba(255,255,255,0.035)] text-[#eef2f7] placeholder:text-[#3a4556] focus:border-[#00dfa2]"
            />
          </FieldGroup>
        </div>
      </FormSection>

      {/* ─── Location ─── */}
      <FormSection
        icon={<MapPin className="h-3 w-3" />}
        title="Location"
        description="Residential details"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldGroup
            label="Country"
            icon={<Globe className="h-3 w-3" />}
            error={errors.country?.message}
          >
            <Select
              defaultValue={user?.country || "maldives"}
              onValueChange={(value) => setValue("country", value)}
            >
              <SelectTrigger className="h-10 rounded-lg border-white/[0.06] text-[0.84rem] !bg-[rgba(255,255,255,0.035)] text-[#eef2f7] focus:border-[#00dfa2]">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent className="border-white/[0.06] bg-[#0a0d15]">
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup
            label="Address"
            icon={<MapPin className="h-3 w-3" />}
            error={errors.address?.message}
          >
            <Input
              id="address"
              {...register("address")}
              className="input-focus-glow h-10 rounded-lg border-white/[0.06] text-[0.84rem] !bg-[rgba(255,255,255,0.035)] text-[#eef2f7] placeholder:text-[#3a4556] focus:border-[#00dfa2]"
            />
          </FieldGroup>

          <FieldGroup
            label="City"
            icon={<MapPin className="h-3 w-3" />}
            hint="Visual-only — not posted"
          >
            <Input
              placeholder="Enter your city"
              className="input-focus-glow h-10 rounded-lg border-white/[0.06] text-[0.84rem] !bg-[rgba(255,255,255,0.035)] text-[#eef2f7] placeholder:text-[#3a4556] focus:border-[#00dfa2]"
            />
          </FieldGroup>

          <FieldGroup
            label="Postal Code"
            icon={<MapPin className="h-3 w-3" />}
            hint="Visual-only — not posted"
          >
            <Input
              placeholder="Enter postal code"
              className="input-focus-glow h-10 rounded-lg border-white/[0.06] text-[0.84rem] !bg-[rgba(255,255,255,0.035)] text-[#eef2f7] placeholder:text-[#3a4556] focus:border-[#00dfa2]"
            />
          </FieldGroup>
        </div>
      </FormSection>

      {/* ─── Account (readonly) ─── */}
      <FormSection
        icon={<IdCard className="h-3 w-3" />}
        title="Account"
        description="Read-only details"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldGroup
            label="Account ID"
            icon={<Fingerprint className="h-3 w-3" />}
          >
            <Input
              value={user?.account_id || "—"}
              readOnly
              className="h-10 cursor-not-allowed rounded-lg border-white/[0.06] text-[0.84rem] opacity-60 !bg-[rgba(255,255,255,0.035)] text-[#eef2f7]"
            />
          </FieldGroup>

          <FieldGroup
            label="Account Type"
            icon={<Info className="h-3 w-3" />}
          >
            <Input
              value={(user?.account_type?.title || "Basic").toUpperCase() + " ACCOUNT"}
              readOnly
              className="h-10 cursor-not-allowed rounded-lg border-white/[0.06] text-[0.84rem] opacity-60 !bg-[rgba(255,255,255,0.035)] text-[#eef2f7]"
            />
          </FieldGroup>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[0.58rem] text-[#3a4556]">
          <Lock className="h-[0.45rem] w-[0.45rem]" />
          Account details are assigned and cannot be modified
        </div>
      </FormSection>

      {/* ─── Action buttons ─── */}
      <div className="flex items-center gap-2.5">
        <Button
          type="submit"
          disabled={isLoading}
          className="!rounded-lg !px-[22px] !py-[10px] text-[0.78rem] font-bold transition-all hover:!shadow-[0_4px_16px_rgba(0,223,162,0.25)] hover:-translate-y-px disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg,#00dfa2,#00b881)",
            color: "#07080c",
          }}
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          {isLoading ? "Submitting..." : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            Object.keys(formSchema.shape).forEach((key) => {
              setValue(key as keyof FormValues, "");
            });
            setImage(null);
          }}
          className="!rounded-lg border-white/[0.06] !bg-[rgba(255,255,255,0.035)] !px-[22px] !py-[10px] text-[0.78rem] font-semibold text-[#8b97a8] hover:!border-white/[0.12] hover:text-[#eef2f7]"
        >
          Reset
        </Button>
      </div>
    </form>
  );
}

/* ─── Form section card (.sec gc + .form-sec) ─── */
function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(175deg,rgba(255,255,255,0.025),transparent 40%)",
        }}
      />
      <div className="relative z-10 mb-4 flex items-center gap-2.5">
        <span
          className="grid h-8 w-8 place-items-center rounded-[10px]"
          style={{
            background: "rgba(0,223,162,0.08)",
            border: "1px solid rgba(0,223,162,0.1)",
            color: "#00dfa2",
          }}
        >
          {icon}
        </span>
        <h4 className="font-[Outfit,sans-serif] text-[0.88rem] font-bold text-[#eef2f7]">
          {title}
        </h4>
        <p className="ml-auto text-[0.68rem] text-[#4a5468]">{description}</p>
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

/* ─── Field group (.flbl) ─── */
function FieldGroup({
  label,
  icon,
  error,
  hint,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[0.67rem] font-semibold uppercase tracking-[0.04em] text-[#4a5468]">
        <span className="text-[#00dfa2]/50">{icon}</span>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[0.68rem] font-semibold text-[#f43f5e]">{error}</p>
      )}
      {hint && !error && (
        <p className="text-[0.58rem] text-[#3a4556]">{hint}</p>
      )}
    </div>
  );
}

