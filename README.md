# Twitter application 


**User Table**

| Column   | Type    |
| -------- | ------- |
| user_id  | INTEGER |
| name     | TEXT    |
| username | TEXT    |
| password | TEXT    |
| gender   | TEXT    |

**Follower Table**

| Column              | Type    |
| ------------------- | ------- |
| `follower_id`       | INTEGER |
| `follower_user_id`  | INTEGER |
| `following_user_id` | INTEGER |


**Tweet Table**

| Column    | Type     |
| --------- | -------- |
| tweet_id  | INTEGER  |
| tweet     | TEXT     |
| user_id   | INTEGER  |
| date_time | DATETIME |

**Reply Table**

| Column    | Type     |
| --------- | -------- |
| reply_id  | INTEGER  |
| tweet_id  | INTEGER  |
| reply     | TEXT     |
| user_id   | INTEGER  |
| date_time | DATETIME |

**Like Table**

| Column    | Type     |
| --------- | -------- |
| like_id   | INTEGER  |
| tweet_id  | INTEGER  |
| user_id   | INTEGER  |
| date_time | DATETIME |



### API 1

#### Path: `/register/`

#### Method: `POST`

### API 2

#### Path: `/login/`

#### Method: `POST`

### API 3

#### Path: `/user/tweets/feed/`

#### Method: `GET`

#### Response

```
 [
   {
      username: "SrBachchan",
      tweet: "T 3859 - do something wonderful, people may imitate it ..",
      dateTime: "2021-04-07 14:50:19"
   },
   ...
 ]
```

### API 4

#### Path: `/user/following/`

#### Method: `GET`

#### Response

```
[
  {
    "name": "Narendra Modi"
  },
  ...
]
```

### API 5

#### Path: `/user/followers/`

#### Method: `GET`

#### Response

```
[
  {
    "name": "Narendra Modi"
  },
  ...
]
```

### API 6

#### Path: `/tweets/:tweetId/`

#### Method: `GET`

  - **Response**
    ```
    {
       "tweet": "T 3859 - do something wonderful, people may imitate it ..",
       "likes": 3,
       "replies": 1,
       "dateTime": "2021-04-07 14:50:19"
    }
    ```

### API 7

#### Path: `/tweets/:tweetId/likes/`

#### Method: `GET`

  - **Response**
    ```
    {
       "likes": ["albert", ]
    }
    ```

### API 8

#### Path: `/tweets/:tweetId/replies/`

#### Method: `GET`

  - **Response**

        ```
        {
           "replies": [
             {
               "name": "Narendra Modi",
               "reply": "When you see it.."
              },
            ...]
        }
        ```

### API 9

#### Path: `/user/tweets/`

#### Method: `GET`

#### Response

```
[
  {
    "tweet": "Ready to don the Blue and Gold",
    "likes": 3,
    "replies": 4,
    "dateTime": "2021-4-3 08:32:44"
  },
  ...
]
```

### API 10

#### Path: `/user/tweets/`

#### Method: `POST`

#### Response

```
Created a Tweet
```

### API 11

#### Path: `/tweets/:tweetId/`

#### Method: `DELETE`

