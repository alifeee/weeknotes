# Weeknotes

Weeknotes!

## PC Development

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Mobile Development (i.e., writing posts)

### MGit

I cloned the repo using MGit - <https://github.com/maks/MGit>. I installed the [F-Droid version of MGit](https://f-droid.org/en/packages/com.manichord.mgit/) through the [F-Droid app store](https://f-droid.org/en/), as the [Google Play version of MGit](https://play.google.com/store/apps/details?id=com.manichord.mgit&hl=en&gl=US) is not supported by Google.

I set up MGit using an SSH key and added the SSH key to my GitHub account, which allows me to do things like push to this repository from my phone.

I set the `Root storage location for repos` in MGit to `/storage/emulated/0/Documents` (i.e., the Android `Documents` folder), so when I clone a repo, it is placed in `Documents`.

### Markor

I installed [Markor](https://play.google.com/store/apps/details?id=net.gsantner.markor&hl=en_GB&gl=US), to edit markdown files. I set the Notebook location to `Documents/markor`, and from here, I can navigate up to `Documents` and to the `weeknotes` folder, where I can edit the markdown files.

### Process

1. Create new markdown file with Markor
1. Write content
1. Open MGit. Stage changes, commit changes, and push changes (just like normal Git)
1. When pushed to git, the [pages.yml](./.github/workflows/pages.yml) workflow runs, building the website with [11ty](https://www.11ty.dev/) and publishing it to my GitHub pages site at <https://weeknotes.alifeee.co.uk>
