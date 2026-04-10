"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { logoutAction } from "@/app/dashboard/actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="ui-button-secondary"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          toast.loading("Encerrando sessão...", { id: "logout" });
          await logoutAction();
          toast.success("Sessão encerrada.", { id: "logout" });
        })
      }
      type="button"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Saindo" : "Sair"}
    </button>
  );
}
