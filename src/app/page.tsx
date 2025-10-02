import { SparkleIcon } from '@/components/SparkleIcon'
import { Layout } from '@/components/Layout'

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-16">
        {/* Commit message suggestions section */}
        <article id="commit-suggestions" className="scroll-mt-16">
          <header className="relative mb-10 xl:mb-0">
            <div className="pointer-events-none absolute top-0 left-[max(-0.5rem,calc(50%-18.625rem))] z-50 flex h-4 items-center justify-end gap-x-2 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:left-0 lg:min-w-lg xl:h-8">
              <a href="#commit-suggestions" className="inline-flex">
                <time className="hidden xl:pointer-events-auto xl:block xl:text-2xs/4 xl:font-medium xl:text-white/50">
                  April 6, 2023
                </time>
              </a>
              <div className="h-0.25 w-3.5 bg-gray-400 lg:-mr-3.5 xl:mr-0 xl:bg-gray-300" />
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
              <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
                <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto">
                  <div className="flex">
                    <a href="#commit-suggestions" className="inline-flex">
                      <time className="text-2xs/4 font-medium text-gray-500 xl:hidden dark:text-white/50">
                        April 6, 2023
                      </time>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
            <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
              <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto typography">
                <div className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 mb-8">
                  <img
                    src="/images/commit-suggestions.png"
                    alt="Commit suggestions feature"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset dark:ring-white/10" />
                </div>
                
                <h2 className="text-2xl font-bold mb-4">Commit message suggestions</h2>
                
                <p className="mb-4">
                  In the latest release, I&apos;ve added support for commit message and description suggestions via an integration with OpenAI. Commit looks at all of your changes, and feeds that into the machine with a bit of prompt-tuning to get back a commit message that does a surprisingly good job at describing the intent of your changes.
                </p>
                
                <p className="mb-6">
                  It&apos;s also been a pretty helpful way to remind myself what the hell I was working on at the end of the day yesterday when I get back to my computer and realize I didn&apos;t commit any of my work.
                </p>
                
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <SparkleIcon /> Improvements
                </h3>
                
                <ul className="list-disc list-inside space-y-2 mb-8">
                  <li>Added commit message and description suggestions powered by OpenAI</li>
                  <li>Fixed race condition that could sometimes leave you in a broken rebase state</li>
                  <li>Improved active project detection to try and ignore file changes triggered by the system instead of the user</li>
                  <li>Fixed bug that sometimes reported the wrong number of changed files</li>
                </ul>
              </div>
            </div>
          </div>
        </article>

        {/* Project configuration files section */}
        <article id="project-configuration" className="scroll-mt-16">
          <header className="relative mb-10 xl:mb-0">
            <div className="pointer-events-none absolute top-0 left-[max(-0.5rem,calc(50%-18.625rem))] z-50 flex h-4 items-center justify-end gap-x-2 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:left-0 lg:min-w-lg xl:h-8">
              <a href="#project-configuration" className="inline-flex">
                <time className="hidden xl:pointer-events-auto xl:block xl:text-2xs/4 xl:font-medium xl:text-white/50">
                  March 17, 2023
                </time>
              </a>
              <div className="h-0.25 w-3.5 bg-gray-400 lg:-mr-3.5 xl:mr-0 xl:bg-gray-300" />
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
              <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
                <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto">
                  <div className="flex">
                    <a href="#project-configuration" className="inline-flex">
                      <time className="text-2xs/4 font-medium text-gray-500 xl:hidden dark:text-white/50">
                        March 17, 2023
                      </time>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
            <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
              <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto typography">
                <div className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 mb-8">
                  <img
                    src="/images/configuration-files.png"
                    alt="Configuration files feature"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset dark:ring-white/10" />
                </div>
                
                <h2 className="text-2xl font-bold mb-4">Project configuration files</h2>
                
                <p className="mb-6">
                  I&apos;ve added support for creating per-project <code>.commitrc</code> files that override your global settings for that particular project. Went with YAML for these because personally I&apos;m sick of quoting keys in JSON all the time, or accidentally leaving in a trailing comma.
                </p>
                
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <SparkleIcon /> Improvements
                </h3>
                
                <ul className="list-disc list-inside space-y-2 mb-8">
                  <li>Added per-project <code>.commitrc</code> configuration files</li>
                  <li>Improved performance when working with projects with large binary files</li>
                  <li>Fixed a bug that could cause Commit to crash when autocommitting after deleting a recently active branch</li>
                </ul>
              </div>
            </div>
          </div>
        </article>

        {/* Dark mode support section */}
        <article id="dark-mode" className="scroll-mt-16">
          <header className="relative mb-10 xl:mb-0">
            <div className="pointer-events-none absolute top-0 left-[max(-0.5rem,calc(50%-18.625rem))] z-50 flex h-4 items-center justify-end gap-x-2 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:left-0 lg:min-w-lg xl:h-8">
              <a href="#dark-mode" className="inline-flex">
                <time className="hidden xl:pointer-events-auto xl:block xl:text-2xs/4 xl:font-medium xl:text-white/50">
                  March 6, 2023
                </time>
              </a>
              <div className="h-0.25 w-3.5 bg-gray-400 lg:-mr-3.5 xl:mr-0 xl:bg-gray-300" />
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
              <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
                <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto">
                  <div className="flex">
                    <a href="#dark-mode" className="inline-flex">
                      <time className="text-2xs/4 font-medium text-gray-500 xl:hidden dark:text-white/50">
                        March 6, 2023
                      </time>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
            <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
              <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto typography">
                <div className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 mb-8">
                  <img
                    src="/images/dark-mode.png"
                    alt="Dark mode feature"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset dark:ring-white/10" />
                </div>
                
                <h2 className="text-2xl font-bold mb-4">Dark mode support</h2>
                
                <p className="mb-6">
                  I released this thing last week hoping a couple of people would say &ldquo;awesome job&rdquo; and make me feel good about what I&apos;d built but instead I just got a ton of people shaming me on X for being such a horrible person for only shipping a light UI.
                </p>
                
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <SparkleIcon /> Improvements
                </h3>
                
                <ul className="list-disc list-inside space-y-2 mb-8">
                  <li>Added dark mode support</li>
                  <li>Improved input field responsiveness when writing a commit message in a project with a large number of changed files</li>
                  <li>Made keyboard shortcut for opening the Commit window customizable</li>
                  <li>Deleted my X account</li>
                </ul>
              </div>
            </div>
          </div>
        </article>

        {/* First release section */}
        <article id="first-release" className="scroll-mt-16">
          <header className="relative mb-10 xl:mb-0">
            <div className="pointer-events-none absolute top-0 left-[max(-0.5rem,calc(50%-18.625rem))] z-50 flex h-4 items-center justify-end gap-x-2 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:left-0 lg:min-w-lg xl:h-8">
              <a href="#first-release" className="inline-flex">
                <time className="hidden xl:pointer-events-auto xl:block xl:text-2xs/4 xl:font-medium xl:text-white/50">
                  March 3, 2023
                </time>
              </a>
              <div className="h-0.25 w-3.5 bg-gray-400 lg:-mr-3.5 xl:mr-0 xl:bg-gray-300" />
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
              <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
                <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto">
                  <div className="flex">
                    <a href="#first-release" className="inline-flex">
                      <time className="text-2xs/4 font-medium text-gray-500 xl:hidden dark:text-white/50">
                        March 3, 2023
                      </time>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
            <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
              <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto typography">
                <div className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 mb-8">
                  <img
                    src="/images/first-release.png"
                    alt="First release"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset dark:ring-white/10" />
                </div>
                
                <h2 className="text-2xl font-bold mb-4">Commit v0.1.0</h2>
                
                <p className="mb-4">
                  Commit is a command palette-style Git client you can pull up from anywhere with a keyboard shortcut that makes it really easy to commit your work. It uses the &ldquo;last modified&rdquo; timestamp of the files in all of your projects to automatically know which project you&apos;re in the middle of working on, so any time you pull up the UI it&apos;s already got the right project selected — you just have to type your commit message, hit <kbd>Cmd</kbd> + <kbd>Enter</kbd> and your changes are captured.
                </p>
                
                <p className="mb-6">
                  I&apos;d be lying if I really thought this was that useful but I was looking for an excuse to learn macOS development and here we are. It&apos;s open source at least so maybe you can find something interesting in the code even if the app itself is a total waste of hard drive space.
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </Layout>
  )
}
