import Image from 'next/image';
import Link from 'next/link';

import ImageHome from '@/../public/img/home.png';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-center items-center p-4  ">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center items-center">
        <div>
          <h1 className="text-[45px] text-orange-400 font-semibold">
            Bem-vindo! <br /> Experimenta a nossa comida
          </h1>
          <h3 className="text-[30px] font-medium text-gray-800">
            Nada une as pessoas como uma boa comida.
          </h3>

          <div className="flex flex-row gap-4 mt-4">
            <Link
              className="p-4 bg-orange-600 rounded-[10px] text-white font-semibold text-center"
              href={'/admin/login'}
            >
              Iniciar sessão como admin
            </Link>

            <Link
              className="p-4 bg-orange-600 rounded-[10px] text-white font-semibold text-center"
              href={'/client/login'}
            >
              Iniciar sessão como cliente
            </Link>
          </div>
        </div>
        <div className="hidden sm:flex">
          <Image src={ImageHome} alt="home_image" />
        </div>
      </div>
    </main>
  );
}
