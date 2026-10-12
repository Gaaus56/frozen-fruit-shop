"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { STAFF_PERMISSIONS, STAFF_PERMISSION_LABELS, type StaffPermission } from "@frozen-fruit-shop/types";
import { SubmitButton, buttonClass } from "@/components/ui/button";
import { Field, FormAlert, inputClass } from "@/components/ui/form";
import { createStaffAction, resetStaffPasswordAction, setStaffActiveAction, updateStaffPermissionsAction } from "./actions";

export const PASSWORD_MIN_LENGTH = 8;

/** Nhóm quyền hay dùng — bấm để tick nhanh. */
const PRESETS: { label: string; permissions: StaffPermission[] }[] = [
  { label: "Bán hàng", permissions: ["orders", "inquiries"] },
  { label: "Sản phẩm", permissions: ["products", "categories"] },
  { label: "Nội dung web", permissions: ["banners", "homeBlocks", "posts", "comments", "pages", "policies"] },
];

/** Bảng tick quyền (gửi lên qua các ô name="permissions"). */
function PermissionPicker({ defaultValue }: { defaultValue: StaffPermission[] }) {
  const [selected, setSelected] = useState<StaffPermission[]>(defaultValue);
  const toggle = (permission: StaffPermission) =>
    setSelected((current) => (current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]));
  const addPreset = (permissions: StaffPermission[]) =>
    setSelected((current) => [...new Set([...current, ...permissions])]);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-bold">Quyền được dùng</legend>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button key={preset.label} type="button" onClick={() => addPreset(preset.permissions)} className={buttonClass("secondary", "sm")}>
            + {preset.label}
          </button>
        ))}
        <button type="button" onClick={() => setSelected([...STAFF_PERMISSIONS])} className={buttonClass("ghost", "sm")}>
          Chọn tất cả
        </button>
        <button type="button" onClick={() => setSelected([])} className={buttonClass("ghost", "sm")}>
          Bỏ hết
        </button>
      </div>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {STAFF_PERMISSIONS.map((permission) => (
          <label key={permission} className="flex cursor-pointer items-start gap-2 border border-divider bg-white px-3 py-2 text-sm hover:border-accent-300">
            <input
              type="checkbox"
              name="permissions"
              value={permission}
              checked={selected.includes(permission)}
              onChange={() => toggle(permission)}
              className="mt-0.5 accent-[#cf2a10]"
            />
            <span>
              <span className="block font-semibold">{STAFF_PERMISSION_LABELS[permission].label}</span>
              <span className="block text-xs text-foreground/55">{STAFF_PERMISSION_LABELS[permission].hint}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="text-xs text-foreground/55">
        Tổng quan doanh thu, Thông tin cửa hàng, Xem trước &amp; sửa và Tài khoản nhân viên luôn chỉ dành cho chủ cửa hàng.
      </p>
    </fieldset>
  );
}

/** Sửa quyền của một nhân viên (mở ngay trong bảng). */
export function EditPermissionsForm({ id, name, permissions }: { id: string; name: string; permissions: StaffPermission[] }) {
  const [open, setOpen] = useState(false);
  // Lưu xong thì đóng bảng quyền ngay trong action (không dùng effect).
  const [state, formAction] = useActionState(async (prev: Awaited<ReturnType<typeof updateStaffPermissionsAction>> | undefined, formData: FormData) => {
    const result = await updateStaffPermissionsAction(id, prev, formData);
    if (result.success) setOpen(false);
    return result;
  }, undefined);

  if (!open) {
    return (
      <span className="inline-flex flex-col items-end gap-1">
        <button type="button" onClick={() => setOpen(true)} className={buttonClass("secondary", "sm")}>
          Phân quyền
        </button>
        {state?.success ? <span className="text-xs font-semibold text-leaf-700">Đã lưu quyền ✓</span> : null}
      </span>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Phân quyền cho ${name}`}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-10"
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <form action={formAction} className="flex w-full max-w-xl flex-col gap-4 bg-surface p-6 text-left shadow-2xl">
        <div>
          <p className="text-lg font-extrabold">Phân quyền</p>
          <p className="text-sm text-foreground/60">{name}</p>
        </div>
        <PermissionPicker defaultValue={permissions} />
        <FormAlert state={state} />
        <div className="flex gap-2">
          <SubmitButton pendingText="Đang lưu...">Lưu quyền</SubmitButton>
          <button type="button" onClick={() => setOpen(false)} className={buttonClass("ghost")}>
            Huỷ
          </button>
        </div>
      </form>
    </div>
  );
}

export function CreateStaffForm() {
  const [state, formAction] = useActionState(createStaffAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <Field label="Họ tên" htmlFor="staff-name" required>
        <input id="staff-name" name="name" required maxLength={100} className={inputClass} />
      </Field>
      <Field label="Email đăng nhập" htmlFor="staff-email" required>
        <input id="staff-email" name="email" type="email" required autoComplete="off" className={inputClass} />
      </Field>
      <Field label="Mật khẩu" htmlFor="staff-password" required hint={`Ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`}>
        <input id="staff-password" name="password" type="text" required minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" className={inputClass} />
      </Field>
      {/* Mặc định chỉ xử lý đơn và liên hệ; tick thêm khi cần. */}
      <PermissionPicker key={state?.success ? "reset" : "form"} defaultValue={["orders", "inquiries"]} />
      <FormAlert state={state} />
      <SubmitButton pendingText="Đang tạo...">Tạo tài khoản</SubmitButton>
    </form>
  );
}

export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await setStaffActiveAction(id, !isActive);
            setError(result.error ?? null);
          })
        }
        className={buttonClass("secondary", "sm")}
      >
        {isActive ? "Khoá" : "Mở khoá"}
      </button>
      {error ? <span className="text-xs font-semibold text-accent-700">{error}</span> : null}
    </span>
  );
}

export function ResetPasswordForm({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(resetStaffPasswordAction.bind(null, id), undefined);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("ghost", "sm")}>
        Đặt lại mật khẩu
      </button>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-xs flex-col items-end gap-2">
      <div className="flex w-full gap-2">
        <input
          name="password"
          type="text"
          required
          minLength={PASSWORD_MIN_LENGTH}
          placeholder="Mật khẩu mới"
          autoComplete="new-password"
          aria-label="Mật khẩu mới"
          className={`${inputClass} mt-0 py-1.5`}
        />
        <SubmitButton size="sm">Lưu</SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className={buttonClass("ghost", "sm")}>
          Đóng
        </button>
      </div>
      <FormAlert state={state} />
    </form>
  );
}
