import { LoginForm } from './LoginForm';

export default async function Login() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col justify-center items-center  bg-[#F2F2F2] w-[300px] h-full p-4 rounded-[20px]">
        <h1 className="font-semibold font-Roboto text-[19px]">
          Iniciar Sessão
        </h1>

        <div className="space-y-5">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
