import { Button } from '@/components/general/Button'
import { Input } from '@/components/general/Input'
import { MainLayout } from '@/layouts/MainLayout'

export const HomePage = () => {
  return (
    <MainLayout title="Clicker Game">
      <main className="py-6 px-2 flex justify-center items-center">
        <section
          className="bg-zinc-100 dark:bg-zinc-900 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl h-fit"
          data-id="form-container"
        >
          <form data-id="form-user-data" className="flex gap-2 items-end">
            <label className="flex flex-col gap-0.5 cursor-pointer">
              <span className="text-zinc-600 dark:text-zinc-400 text-sm font-semibold">
                Player name
              </span>
              <Input name="name" type="text" autoComplete="off" />
            </label>

            <Button type="submit"> Play! </Button>
          </form>

          <div data-id="lobby-message" className="text-zinc-400 mt-4"></div>
        </section>

        <section
          className="bg-zinc-100 dark:bg-zinc-900 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl h-fit w-full max-w-lg hidden"
          data-id="game-container"
        >
          <header>
            <h2
              data-id="game-header-text"
              className="text-center font-semibold"
            ></h2>
          </header>
          <div data-id="game-message" className="text-zinc-400 mt-4"></div>
        </section>
      </main>

      <div className="flex justify-between items-end p-4">
        <div
          data-id="footer-message"
          className="font-semibold text-zinc-400"
        ></div>
      </div>

      <div
        data-id="temporal-message"
        className="font-semibold p-3 w-fit max-w-80
      absolute bottom-4 right-4
      bg-zinc-900 rounded-md transition opacity-0"
      ></div>
    </MainLayout>
  )
}
