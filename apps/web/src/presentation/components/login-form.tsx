"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { ArrowRight, Github, Mail } from "lucide-react";
import { toast } from "sonner";
import { loginWithCredentials, loginWithOAuth } from "@/app/login/actions";
import { signInSchema } from "@/application/validators/auth-schemas";

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginFormProps = {
  oauthProviders: {
    google: boolean;
    github: boolean;
  };
};

export function LoginForm({ oauthProviders }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isOAuthPending, startOAuthTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((values: LoginFormValues) => {
    startTransition(async () => {
      toast.loading("Validando acesso...", { id: "login" });
      const formData = new FormData();
      formData.set("email", values.email);
      formData.set("password", values.password);
      const response = await loginWithCredentials({}, formData);

      if (response.error) {
        toast.error(response.error, { id: "login" });
        return;
      }

      toast.success("Redirecionando para o painel...", { id: "login" });
    });
  });

  return (
    <div className="space-y-6">
      <form className="space-y-4" method="post" noValidate onSubmit={onSubmit}>
        <div>
          <label className="ui-label" htmlFor="email">
            E-mail
          </label>
          <input
            autoComplete="email"
            className="ui-input"
            id="email"
            placeholder="voce@estudo.com"
            type="email"
            {...register("email")}
          />
          {errors.email ? <p className="mt-2 text-sm text-danger">{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="ui-label" htmlFor="password">
            Senha
          </label>
          <input autoComplete="current-password" className="ui-input" id="password" type="password" {...register("password")} />
          {errors.password ? <p className="mt-2 text-sm text-danger">{errors.password.message}</p> : null}
        </div>

        <button className="ui-button-primary w-full sm:w-auto" disabled={isPending} type="submit">
          <ArrowRight className="h-4 w-4" />
          {isPending ? "Entrando" : "Entrar"}
        </button>
      </form>

      {oauthProviders.google || oauthProviders.github ? (
        <div className="space-y-3">
          <p className="ui-label mb-0">Acesso alternativo</p>
          <div className="flex flex-wrap gap-3">
            {oauthProviders.google ? (
              <button
                className="ui-button-secondary"
                disabled={isOAuthPending}
                onClick={() =>
                  startOAuthTransition(async () => {
                    toast.loading("Abrindo login com Google...", { id: "oauth-google" });
                    await loginWithOAuth("google");
                  })
                }
                type="button"
              >
                <Mail className="h-4 w-4" />
                Google
              </button>
            ) : null}
            {oauthProviders.github ? (
              <button
                className="ui-button-secondary"
                disabled={isOAuthPending}
                onClick={() =>
                  startOAuthTransition(async () => {
                    toast.loading("Abrindo login com GitHub...", { id: "oauth-github" });
                    await loginWithOAuth("github");
                  })
                }
                type="button"
              >
                <Github className="h-4 w-4" />
                GitHub
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
