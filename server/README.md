As for other services, this service was built to showcase several best practices without being complete or adapted to the current scale of this project.

# Using this server

## Commands

Starting the server:
```yarn start```

Starting the server with a watcher on files (Nodemon):
```yarn dev```

# Technical approach & best practices

## File structure

Appart from the different global tools like helpers and middlewares the folder structure is organized with a functional approach. This helps developpers working on a feature to easily find all the files for a specific feature. It also prevents folders from having too many files. Finally, it undirectly recreates the structure of the REST API.

## Logger

Important to have user readable messages, timestamps and output objects. Can be easily expanded to plug in online monitoring tools.

## Error handler

Important to centralize the handling of error, handle unexpected errors and have a foundation for more advanced error handling in the future (handling unauthorized errors, not found errors etc...). 

It is also important to hide the details of errors to the front-end client so we don't give any kind of information to a potential attacker of our system.