# spajam-edps
SPAJAMハッカソンのedpsチーム

### 依存関係のインストール
```
docker compose run --rm app bash -lc 'cd mobile && npm install'
```

### 開発サーバーの起動
```
docker compose run --rm --service-ports app bash -lc 'cd mobile && npm start'
```

#### IPアドレス検索
```
ifconfig | grep "192"
```

#### envファイルの追加
spajamappディレクトリに取得したIPアドレスを追加する
```
REACT_NATIVE_PACKAGER_HOSTNAME=xxx.xxx.xx.xxx
```
