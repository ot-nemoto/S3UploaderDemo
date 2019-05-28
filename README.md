# S3UploaderDemo

## 概要

![キリン](https://raw.githubusercontent.com/ot-nemoto/S3UploaderDemo/master/sample.jpg)

- 構成

```
    +-------------+     +---------+     +----------+
--> | API Gateway | --> | Lambda  | --> |    S3    |
    |             |     |(upload) |     |          |
    +-------------+     +---------+     +----------+
                            |                |       +----------+
                            +---(uploaded)---+-----> | DynamoDB |
                        +---------+          |       |          |
                        |         | <--------+       |          |
                        | Lambda  | <--------------- |          |
                        |(process)| --(processed)--> |          |
                        +---------+                  |          |
                        +---------+                  |          |
                        | Lambda  | <--------------- |          |
                        |(notice) | --(notified)---> |          |
                        +---------+                  +----------+
                            |                        +----------+
                            +----------------------> |   SNS    | --> mail
                                                     +----------+
```

- API でファイルをアップロードすると、Lambda(upload)はS3にファイルを保存し、DynamoDBにデータを登録(Status: `uploaded`)
- DynamoDB StreamをトリガーにLambda(process)を起動し、DynamoDBのデータを更新(Status: `processed`)
- DynamoDB StreamをトリガーにLambda(notice)を起動し、SNSトピックにメッセージを発行し、DynamoDBのデータを更新(Status: `notified`)

**課題**

- DynamoDB Streamを利用すると、すべての対象テーブルのストリームをトリガーとしているLambdaが起動する
- 今回の構成の場合、Lambda(process)とLambda(notice)
- 自分でStatusを更新した場合もトリガーが走る
- そのため、Lambda内でステータスをチェックしなくてはならない
- DynamoDB Streamをトリガーとして使うケースで、テーブルで状態を管理する場合には向かないのかもしれない

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
