# Yahoo商品ステータス更新APIインターフェース仕様書

## 1. Yahoo オークションステータス更新 API

### エンドポイント
```
PUT /api/yahoo-auction/status-update/{id}/
```

### リクエストパラメータ
| パラメータ | 型 | 必須 | 説明 |
|:----------|:---|:-----|:-----|
| id | integer | 必須 | 更新対象のYahooオークション商品ID |

### リクエストボディ
```json
{
  "status_id": 1
}
```

| フィールド | 型 | 必須 | 説明 |
|:----------|:---|:-----|:-----|
| status_id | integer | 必須 | 設定するステータスID |

### レスポンス（成功時）
- ステータスコード: 200 OK
```json
{
  "detail": "ステータスが正常に更新されました"
}
```

### エラーレスポンス
- 商品が見つからない場合（404 Not Found）
```json
{
  "detail": "指定されたオークション情報が見つかりません"
}
```

- ステータスIDが無効な場合（400 Bad Request）
```json
{
  "detail": "指定されたステータスが存在しません"
}
```

- バリデーションエラー（400 Bad Request）
```json
{
  "status_id": ["このフィールドは必須です。"]
}
```

## 2. Yahoo フリマステータス更新 API

### エンドポイント
```
PUT /api/yahoo-free-market/status-update/{id}/
```

### リクエストパラメータ
| パラメータ | 型 | 必須 | 説明 |
|:----------|:---|:-----|:-----|
| id | integer | 必須 | 更新対象のYahooフリマ商品ID |

### リクエストボディ
```json
{
  "status_id": 1
}
```

| フィールド | 型 | 必須 | 説明 |
|:----------|:---|:-----|:-----|
| status_id | integer | 必須 | 設定するステータスID |

### レスポンス（成功時）
- ステータスコード: 200 OK
```json
{
  "detail": "ステータスが正常に更新されました"
}
```

### エラーレスポンス
- 商品が見つからない場合（404 Not Found）
```json
{
  "detail": "指定されたフリマ情報が見つかりません"
}
```

- ステータスIDが無効な場合（400 Bad Request）
```json
{
  "detail": "指定されたステータスが存在しません"
}
```

- バリデーションエラー（400 Bad Request）
```json
{
  "status_id": ["このフィールドは必須です。"]
}
```

## 3. 認証要件

両APIとも認証済みユーザーのみアクセス可能です。ユーザーは自分が登録した商品のステータスのみ更新できます。
