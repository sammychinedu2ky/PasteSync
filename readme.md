# PasteSync

PasteSync is a tool designed to synchronize clipboard content across multiple devices seamlessly. This tool ensures that your clipboard data is always up-to-date and accessible, regardless of the device you are using.

## Features

- **Real-Time Synchronization**: Changes to your clipboard are instantly reflected on all connected devices.

## Getting Started

- ensure your redis is running, and set the connection string in the `appsettings.json` file in the backend directory.
- cd into backend and execute `dotnet run`
- cd into the frontend  directory, install dependencies and exeute `npm run dev`
- Open the application in your browser and click on `Generate Board`
- Duplicate the web page, type in one and see it sync in real time in the duplicate tab.
