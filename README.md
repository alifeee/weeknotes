# Weeknotes

[Weeknotes!](http://alifeee.co.uk/weeknotes/)

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

1. Open MGit. Create new file in `./weeknotes/`.
1. Open file with Markor and write content
1. Exit back to MGit, then stage, commit, and push changes (just like normal Git)
1. When pushed to git, the [pages.yml](./.github/workflows/pages.yml) workflow runs, building the website with [11ty](https://www.11ty.dev/) and publishing it to my GitHub pages site at <https://weeknotes.alifeee.co.uk>

## Topics

Topics are provided per-weeknote in [`_data/topics.yaml`](_data_/topics.yaml). This is transformed into a 2D array with [`_data/topicstable.js`], which can be used in the template to build the topics on the homepage.

To see a list of all topics, use the bash command:

```bash
cat _data/topics.yaml | pcregrep -o1 "^- (.*)$" | sort | uniq
```

## Archiving

Old posts are "archived". The age past-which to archive is specified in [`./_data/archive.json`](./_data/archive.json)

```json
{ "archive_older_than_days": 31 }
```

"Archiving" is really just "hiding" the content with a `<details>` element.

```hbs
{{#if (gt (daysago page.fileSlug ) archive.archive_older_than_days)}}
  <p class="archive-text">this weeknote is archived for the sins of being over 1 month old.</p>
  <details>
    <summary class="summary">if you have good reason to read it, show anyway</summary>
{{/if}}
```
