"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import type { OtpStatus } from "@frozen-fruit-shop/types";
import { SubmitButton, buttonClass } from "@/components/ui/button";
import { Field, FormAlert, inputClass } from "@/components/ui/form";
import { formatDateTime } from "@/lib/format";
import { otpDisableAction, otpEnableAction, otpRecoveryCodesAction, otpSetupAction, type RecoveryCodesState } from "@/lib/otp-actions";

const codeInputClass = `${inputClass} text-center text-xl font-bold tracking-[0.3em]`;

function CodeInput({ id }: { id: string }) {
  return (
    <input
      id={id}
      name="code"
      required
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={9}
      placeholder="123 456"
      className={codeInputClass}
    />
  );
}

/** Bật / tắt xác thực 2 lớp (OTP qua app Authenticator) cho chính tài khoản đang đăng nhập. */
export function OtpSection({ status }: { status: OtpStatus }) {
  // Giữ ở component cha: bật OTP xong server lưu token mới vào cookie → Next tự tải lại dữ liệu trang, status thành
  // "đang bật" ngay; nếu state nằm trong OtpSetupFlow thì khung mã dự phòng bị thay trước khi kịp hiện.
  const [enableState, enableAction] = useActionState(otpEnableAction, undefined);
  const [seenCodes, setSeenCodes] = useState<typeof enableState>(undefined);
  if (enableState?.recoveryCodes && seenCodes !== enableState) {
    return <RecoveryCodes codes={enableState.recoveryCodes} intro="Đã bật xác thực 2 lớp ✓" onDone={() => setSeenCodes(enableState)} />;
  }
  return status.enabled ? <OtpEnabled status={status} /> : <OtpSetupFlow enableState={enableState} enableAction={enableAction} />;
}

// ─────────── Đang tắt → bật ───────────

function OtpSetupFlow({
  enableState,
  enableAction,
}: {
  enableState: RecoveryCodesState | undefined;
  enableAction: (formData: FormData) => void;
}) {
  const [started, setStarted] = useState(false);
  const [setupState, setupAction] = useActionState(otpSetupAction, undefined);

  if (!started) {
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p className="text-foreground/75">
          Ngoài mật khẩu, mỗi lần đăng nhập phải nhập thêm <b>mã 6 số</b> trên điện thoại (đổi mỗi 30 giây). Lộ mật khẩu, người khác cũng
          không vào được nếu không cầm điện thoại của bạn.
        </p>
        <p className="text-foreground/75">
          Cần app miễn phí <b>Google Authenticator</b> hoặc <b>Microsoft Authenticator</b> (App Store / CH Play).
        </p>
        <button type="button" onClick={() => setStarted(true)} className={buttonClass("primary", "md", "w-fit")}>
          Bật xác thực 2 lớp
        </button>
      </div>
    );
  }

  if (!setupState?.setup) {
    return (
      <form action={setupAction} className="flex flex-col gap-4">
        <p className="text-sm text-foreground/75">Bước 1/2 — nhập lại mật khẩu để xác nhận là bạn.</p>
        <Field label="Mật khẩu hiện tại" htmlFor="otp-password" required>
          <input id="otp-password" name="password" type="password" required autoFocus autoComplete="current-password" className={inputClass} />
        </Field>
        <FormAlert state={setupState} />
        <div className="flex gap-2">
          <SubmitButton pendingText="Đang tạo mã QR...">Tiếp tục</SubmitButton>
          <button type="button" onClick={() => setStarted(false)} className={buttonClass("ghost")}>
            Huỷ
          </button>
        </div>
      </form>
    );
  }

  const { setup } = setupState;
  return (
    <form action={enableAction} className="flex flex-col gap-4 text-sm">
      <p className="text-foreground/75">
        Bước 2/2 — mở app Authenticator, bấm <b>+</b> → <b>Quét mã QR</b>, rồi nhập mã 6 số app hiện ra.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR dạng data URL do API tạo */}
        <img src={setup.qrDataUrl} alt="Mã QR để thêm tài khoản vào app xác thực" width={176} height={176} className="border border-divider bg-white p-1" />
        <div className="min-w-0 flex-1 text-xs text-foreground/65">
          Không quét được? Chọn <b>Nhập khoá thiết lập</b> trong app và gõ:
          <code className="mt-1 block select-all break-all border border-divider bg-muted px-2 py-1.5 font-mono text-sm text-foreground">
            {setup.secret.replace(/(.{4})/g, "$1 ").trim()}
          </code>
        </div>
      </div>
      <Field label="Mã 6 số trong app" htmlFor="otp-enable-code" required>
        <CodeInput id="otp-enable-code" />
      </Field>
      <FormAlert state={enableState} />
      <SubmitButton pendingText="Đang kiểm tra..." className="w-fit">
        Xác nhận và bật
      </SubmitButton>
    </form>
  );
}

// ─────────── Đang bật ───────────

function OtpEnabled({ status }: { status: OtpStatus }) {
  const [panel, setPanel] = useState<"none" | "codes" | "disable">("none");
  const [codesState, codesAction] = useActionState(otpRecoveryCodesAction, undefined);
  const router = useRouter();
  const [disableState, disableAction] = useActionState(async (prev: Awaited<ReturnType<typeof otpDisableAction>> | undefined, formData: FormData) => {
    const result = await otpDisableAction(prev, formData);
    if (result.success) router.refresh();
    return result;
  }, undefined);

  // Đã xem xong bộ mã mới thì quay lại khung trạng thái (so theo đúng lần tạo mã).
  const [seenCodes, setSeenCodes] = useState<typeof codesState>(undefined);
  if (codesState?.recoveryCodes && seenCodes !== codesState) {
    return (
      <RecoveryCodes
        codes={codesState.recoveryCodes}
        intro="Đã tạo bộ mã dự phòng mới — các mã cũ hết hiệu lực."
        onDone={() => {
          setSeenCodes(codesState);
          setPanel("none");
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <p className="border-l-4 border-leaf-600 bg-leaf-50 px-4 py-2.5 text-leaf-700">
        <b>Đang bật</b> từ {formatDateTime(status.enabledAt)} · còn <b>{status.recoveryCodesLeft}</b> mã dự phòng
        {status.recoveryCodesLeft <= 2 ? " — nên tạo bộ mã mới." : "."}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setPanel(panel === "codes" ? "none" : "codes")} className={buttonClass("secondary", "sm")}>
          Tạo lại mã dự phòng
        </button>
        <button type="button" onClick={() => setPanel(panel === "disable" ? "none" : "disable")} className={buttonClass("ghost", "sm")}>
          Tắt xác thực 2 lớp
        </button>
      </div>

      {panel === "codes" ? (
        <form action={codesAction} className="flex flex-col gap-3 border-t border-divider pt-4">
          <Field label="Mã 6 số trong app" htmlFor="otp-codes-code" required>
            <CodeInput id="otp-codes-code" />
          </Field>
          <FormAlert state={codesState} />
          <SubmitButton pendingText="Đang tạo..." className="w-fit">
            Tạo 8 mã mới
          </SubmitButton>
        </form>
      ) : null}

      {panel === "disable" ? (
        <form action={disableAction} className="flex flex-col gap-3 border-t border-divider pt-4">
          <p className="font-semibold text-accent-700">Tắt đi thì chỉ cần mật khẩu là đăng nhập được. Chỉ tắt khi đổi điện thoại (rồi bật lại ngay).</p>
          <Field label="Mật khẩu hiện tại" htmlFor="otp-disable-password" required>
            <input id="otp-disable-password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
          </Field>
          <Field label="Mã 6 số trong app (hoặc mã dự phòng)" htmlFor="otp-disable-code" required>
            <CodeInput id="otp-disable-code" />
          </Field>
          <FormAlert state={disableState} />
          <SubmitButton pendingText="Đang tắt..." className="w-fit">
            Tắt xác thực 2 lớp
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}

// ─────────── Mã dự phòng (hiện đúng một lần) ───────────

function RecoveryCodes({ codes, intro, onDone }: { codes: string[]; intro: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = `Mã dự phòng đăng nhập — Trái Cây 28 (quản trị)\nMỗi mã dùng được một lần khi mất điện thoại.\n\n${codes.join("\n")}\n`;

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ma-du-phong-trai-cay-28.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <p className="font-bold text-leaf-700">{intro}</p>
      <p className="text-foreground/75">
        <b>Lưu ngay 8 mã dự phòng</b> (in ra giấy, hoặc tải file cất nơi an toàn). Mất điện thoại thì nhập một mã thay cho mã 6 số — mỗi mã dùng
        một lần. <b>Các mã chỉ hiện đúng lần này.</b>
      </p>
      <ol className="grid grid-cols-2 gap-2 border border-divider bg-muted p-4 font-mono text-base font-bold tracking-wider">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={download} className={buttonClass("secondary", "sm")}>
          Tải file .txt
        </button>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(codes.join("\n")).then(() => setCopied(true))}
          className={buttonClass("secondary", "sm")}
        >
          {copied ? "Đã sao chép ✓" : "Sao chép"}
        </button>
        <button type="button" onClick={onDone} className={buttonClass("primary", "sm")}>
          Tôi đã lưu các mã
        </button>
      </div>
    </div>
  );
}
