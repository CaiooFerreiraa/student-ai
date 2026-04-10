import { NextResponse, type NextRequest } from "next/server";
import { registerUser } from "@/application/use-cases/register-user";
import { registerApiBodySchema } from "@/application/validators/api-security-schemas";
import { createApiRoute, createPreflightHandler } from "@/infrastructure/security/api-route";

type RegisterRequestBody = {
  name: string;
  email: string;
  password: string;
};

export const OPTIONS = createPreflightHandler();

export const POST = createApiRoute<RegisterRequestBody, undefined, undefined>(
  {
    body: registerApiBodySchema,
  },
  async ({
    body,
  }: {
    request: NextRequest;
    body: RegisterRequestBody;
    query: undefined;
    params: undefined;
  }) => {
    try {
      const user = await registerUser(body);

      return NextResponse.json(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          message: "Conta criada com sucesso.",
        },
        { status: 201 },
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      return NextResponse.json({ error: "Falha ao criar conta." }, { status: 500 });
    }
  },
);
