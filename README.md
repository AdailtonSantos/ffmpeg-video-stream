## FFMPEG + Node Streams

Este projeto é um pequeno teste para servir vídeos sob demanda com node streams e aplicar filtros e edição no vídeo conforme ele é processado

## Como executar

### 1. É necessário possuir o Docker instalado na máquina e a imagem do linuxserver/ffmpeg baixada

### 2. Preparar o arquivo inicial com o ffmpeg

Execute no terminal:

`docker run --rm -v "$(PWD):/data" linuxserver/ffmpeg -i /data/assets/video.mp4 -f mp4 -vcodec h264 -acodec aac -movflags frag_keyframe+empty_moov+default_base_moof -b:v 1500k -maxrate 1500k -bufsize 1000k -f mp4 /data/assets/video_ready.mp4`

Isso irá preparar o vídeo para que ele possa ser consumido da forma correta para o FFMPEG aplicar as edições

### 3. Executar o servidor web

Execute no terminal:

`npm run start`

E o servidor web que faz todo o processamento será executado

### 3. Servindo o arquivo index.html na web

Caso queira, basta executar `npm run web` e o arquivo index será executado na porta 8080
Caso não ache necessário, basta abrir o arquivo html diretamente da pasta
