"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { registerWithCredentials } from "@/app/register/actions";
import { signUpSchema } from "@/application/validators/auth-schemas";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((values: RegisterFormValues) => {
    startTransition(async () => {
      toast.loading("Criando acesso...", { id: "register" });
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("email", values.email);
      formData.set("password", values.password);
      const response = await registerWithCredentials({}, formData);

      if (response.error) {
        toast.error(response.error, { id: "register" });
        return;
      }

      toast.success("Conta criada. Entrando no painel...", { id: "register" });
    });
  });

  return (
    <form className="space-y-4" method="post" noValidate onSubmit={onSubmit}>
      <div>
        <label className="ui-label" htmlFor="name">
          Nome
        </label>
        <input autoComplete="name" className="ui-input" id="name" placeholder="Seu nome" type="text" {...register("name")} />
        {errors.name ? <p className="mt-2 text-sm text-danger">{errors.name.message}</p> : null}
      </div>

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
        <input autoComplete="new-password" className="ui-input" id="password" type="password" {...register("password")} />
        {errors.password ? <p className="mt-2 text-sm text-danger">{errors.password.message}</p> : null}
      </div>

      <button className="ui-button-primary w-full sm:w-auto" disabled={isPending} type="submit">
        <ArrowRight className="h-4 w-4" />
        {isPending ? "Criando" : "Criar conta"}
      </button>
    </form>
  );
}
