# Charity Royale Twitch Chatbot

The Charity Royale Twitch Chatbot is part of [charityroyale.at](charityroyale.at) a yearly fundraising event for childrens dreams. It allows users to interact via Twitch Chat on participating streamers to obtain content for Charity Royale.

# Requirements

NodeJS with version defined in `.nvmrc`. It is recommended to use `nvm` (Node Version Manager) to install and manage different installed NodeJS versions. To use the required version run `nvm use` from root directly. To verify the installation and version used, one runs `node -v` and `npm -v`

NodeJS installs `npm` default which manages vendor packages used in the project defined in `package.json` in the root directly. To install the required dependencies use `npm install` from root directly.

# Development

To build the project it is required to set environment variables defined in `.env.example`. Create a `.env` file (`touch .env`) in root directly add the values.

It is recommended to use a DB client such as `MongoDB Compass` for local development.

To interact with the application run npm scripts defined in `package.json`.

`npm run build` runs TypeScript compiler an outputs the files in `dist` folder in root directly.

To start the application run `npm run start`.

`npm run lint` lints typescript files by rules defined in `.eslintrc`.

# Deployment

TBA

# Usage

## how to add/edit/delete a command

Requires you to be a mod/streamer for the channel.

- !add <command\> <response\>
- !edit <command\> <response\>
- !delete <command\>

# Contribution

TBA

# Press

![Charity Royale Logo](./docs/cr_logo_small.png)
![Make A Wish Austria Foundation Logo](./docs/maw_logo_small.svg)
