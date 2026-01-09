
export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verifique seu e-mail
          </h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de login para o seu endereço de e-mail.
          </p>
        </div>
      </div>
    </div>
  );
}
