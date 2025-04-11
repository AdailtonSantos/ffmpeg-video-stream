import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { spawn } from 'node:child_process';

const port = 8081
createServer(async (request, response) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
    }

    if (request.method === 'OPTIONS') {
        response.writeHead(204, headers)
        return response.end();
    }

    response.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Access-Control-Allow-Origin': '*',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
    });

    // Executa o FFMPEG via imagem do docker
    const ffmpegProcess = spawn('docker', [
        'run', '--rm', '-i',
        '-v', `${process.cwd()}:/data`,
        'linuxserver/ffmpeg',
        '-i', 'pipe:0',
        '-f', 'mp4',
        '-vcodec', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
        '-vf', 
        `monochrome,drawtext=text='ffmpeg-with-docker!':
            x=10:
            y=H-th-10:
            fontsize=50:
            fontcolor=white:
        `,
        '-f', 'mp4',
        'pipe:1'
    ], {
        // A ordem é: stdin, stdout, stderr.
        // Passamos pipe para conseguir utilizar a função pipe() nos três.
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // O arquivo lido pelo readStream precisa ser um vídeo já tratado anteriormente pelo FFMPEG
    // Pois precisa estar no "formato cortado" para poder ser servido como stream
    // O comando para preparar o arquivo é o mesmo acima, mas na entrada e na saída (pipe:0 e pipe:1) precisam ser passados os arquivos de entrada e como ele deve sair
    // Resumindo, deve ficar: 
    // docker run --rm -v "$(PWD):/data" linuxserver/ffmpeg -i /data/assets/video.mp4 -f mp4 -vcodec h264 -acodec aac -movflags frag_keyframe+empty_moov+default_base_moof -b:v 1500k -maxrate 1500k -bufsize 1000k -f mp4 /data/assets/video_ready.mp4
    // Isso rodado no terminal para preparar o vídeo antes de iniciar a aplicação
    createReadStream('./assets/video_ready.mp4').pipe(ffmpegProcess.stdin)

    ffmpegProcess.stderr.on('data', msg => console.log(msg.toString()))
    ffmpegProcess.stdout.pipe(response)


    // Garante que o processo seja finalizado quando o usuário fechar a aba do vídeo
    request.once('close', () => {
        ffmpegProcess.stdin.destroy()
        ffmpegProcess.stdout.destroy()
        ffmpegProcess.kill()
        console.log('Disconnected')
    })
}).listen(port, () => console.log(`Servidor rodando na porta ${port}`))