FROM alpine:latest

RUN apk update && \
    apk add nodejs npm git && \
    git clone https://github.com/Jacherr/Assyst-TS /home/assyst && \
    cd /home/assyst && \
    npm i && \
    npm i -g typescript && \
    cp privateConfig.example.json privateConfig.json && \
    tsc

CMD sh
