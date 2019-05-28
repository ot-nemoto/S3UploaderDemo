# S3UploaderDemo

## 概要

![キリン](https://raw.githubusercontent.com/ot-nemoto/S3UploaderDemo/master/sample.jpg)

## デプロイ

_SNS endpoint_ は処理完了の通知先のアドレス(未指定の場合は `s3-uploader-demo@example.com`)

```sh
make deploy email=<SNS endpoint>
  # ...
  # Successfully created/updated stack - s3-uploader-demo-stack
  #
  # > A confirmation email has been sent to the notification destination.
  #
  #   <SNS endpoint>
  #
  # > API to upgrade sample.jpg to S3.
  #
  #   curl -X POST -H 'Content-type: image/jpeg' --data-binary '@sample.jpg' <Upload API>
  #
```

- 処理完了をSNSトピックに通知します。サブスクリプションでメール通知するようにしているので、確認メールを許可するまで通知しません。メールを確認し通知を許可して下さい。
- `make deploy` 実行後に表示されるコマンド実行することで sample.jpg をS3へアップロードするためのAPIを叩き、一連の処理が開始されます。

## アンデプロイ

```sh
make undeploy
```
