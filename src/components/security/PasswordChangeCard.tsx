import * as React from "react";
import { useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EyeOff,
  Eye,
  Lock,
  Key,
  CheckCheck,
  Check,
  Circle,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

// ── Validation schema (UNCHANGED) ──────────────────────────────────
const passwordFormSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type PwFormValues = z.infer<typeof passwordFormSchema>;
type FieldKey = keyof PwFormValues;

interface PwFieldProps {
  name: FieldKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  control: Control<PwFormValues>;
}

function PwField({
  name,
  label,
  icon: Icon,
  placeholder,
  show,
  onToggle,
  control,
}: PwFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-0">
          <FormLabel className="mb-1.5 flex items-center gap-1.5 text-[0.67rem] font-semibold uppercase tracking-[0.04em] text-[#4a5468]">
            <Icon className="h-[0.55rem] w-[0.55rem] text-[#00dfa2] opacity-50" />
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                {...field}
                className="h-auto w-full rounded-lg border border-white/[0.06] px-[15px] py-3 text-[0.84rem] font-medium text-[#eef2f7] placeholder:text-[#3a4556] focus:border-[#00dfa2] focus:ring-[3px] focus:ring-[rgba(0,223,162,0.06)]"
                style={{ background: "rgba(255,255,255,0.035)" }}
              />
              <button
                type="button"
                onClick={onToggle}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[0.75rem] text-[#3a4556] transition-colors hover:text-[#eef2f7]"
              >
                {show ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </FormControl>
          <FormMessage className="mt-1.5 text-[0.68rem] font-semibold text-[#f43f5e]" />
        </FormItem>
      )}
    />
  );
}

function PwReq({
  label,
  met,
  full,
}: {
  label: string;
  met: boolean;
  full?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-[0.72rem] transition-colors ${
        met ? "font-semibold text-[#00dfa2]" : "font-medium text-[#3a4556]"
      }`}
      style={full ? { gridColumn: "1 / -1" } : undefined}
    >
      {met ? (
        <Check className="h-3 w-3 shrink-0 text-[#00dfa2]" strokeWidth={3} />
      ) : (
        <Circle
          className="h-[0.62rem] w-[0.62rem] shrink-0"
          fill="currentColor"
        />
      )}
      <span>{label}</span>
    </div>
  );
}

export function PasswordChangeCard() {
  // ── Existing state (UNCHANGED) ──
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // ── Existing form setup (UNCHANGED) ──
  const form = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const watchedNewPassword = form.watch("new_password");
  const watchedConfirmPassword = form.watch("confirm_password");

  const reqs = {
    len: watchedNewPassword.length >= 8,
    upper: /[A-Z]/.test(watchedNewPassword),
    num: /[0-9]/.test(watchedNewPassword),
    special: /[^A-Za-z0-9]/.test(watchedNewPassword),
    match:
      watchedNewPassword.length > 0 &&
      watchedNewPassword === watchedConfirmPassword,
  };

  // ── Existing handler (UNCHANGED) ──
  const handleChangePassword = async (
    values: z.infer<typeof passwordFormSchema>
  ) => {
    try {
      setIsSubmitting(true);
      console.log("Form values:", values);
      await axiosInstance.post("/change/password", {
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_new_password: values.confirm_password,
      });
      toast.success("Password changed successfully");
      form.reset();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Failed to change password"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="relative mb-[18px] overflow-hidden rounded-2xl border border-white/[0.06] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(175deg,rgba(255,255,255,0.025),transparent 40%)",
        }}
      />

      {/* sec-hd */}
      <div className="relative z-10 mb-[18px] flex items-center gap-2.5 border-b border-white/[0.06] pb-[14px]">
        <Lock className="h-[0.85rem] w-[0.85rem] shrink-0 text-[#00dfa2]" />
        <h3 className="flex-1 font-[Outfit,sans-serif] text-[0.95rem] font-bold text-[#eef2f7]">
          Password &amp; Login
        </h3>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleChangePassword)}
          className="relative z-10"
        >
          {/* .fg grid: 1fr 1fr, gap 16 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <PwField
              name="current_password"
              label="Current Password"
              icon={Key}
              placeholder="Enter current password"
              show={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((v) => !v)}
              control={form.control}
            />
            <PwField
              name="new_password"
              label="New Password"
              icon={Lock}
              placeholder="Min. 8 characters"
              show={showNewPassword}
              onToggle={() => setShowNewPassword((v) => !v)}
              control={form.control}
            />
            <PwField
              name="confirm_password"
              label="Confirm"
              icon={CheckCheck}
              placeholder="Re-enter new password"
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((v) => !v)}
              control={form.control}
            />
          </div>

          {/* .pw-reqs: grid 1fr 1fr, gap 6/14 */}
          <div
            className="mt-3 grid gap-y-1.5 gap-x-3.5 rounded-lg border border-white/[0.06] px-4 py-3 sm:grid-cols-2"
            style={{ background: "rgba(255,255,255,0.035)" }}
          >
            <PwReq label="Min 8 characters" met={reqs.len} />
            <PwReq label="One uppercase letter" met={reqs.upper} />
            <PwReq label="One number" met={reqs.num} />
            <PwReq label="One special character" met={reqs.special} />
            <PwReq label="Passwords match" met={reqs.match} full />
          </div>

          {/* .btn-row */}
          <div className="mt-[18px] flex flex-wrap gap-2.5">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-[7px] rounded-lg border-0 px-[22px] py-[10px] text-[0.78rem] font-bold text-[#07080c] transition-all hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,223,162,0.25)] disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
              style={{
                background:
                  "linear-gradient(135deg, #00dfa2, #00b881)",
              }}
            >
              {isSubmitting ? "Updating..." : "Change Password"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              className="rounded-lg border border-white/[0.06] px-[22px] py-[10px] text-[0.78rem] font-semibold text-[#8b97a8] hover:border-white/[0.12] hover:text-[#eef2f7]"
              style={{ background: "rgba(255,255,255,0.035)" }}
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
