const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'twitterClone.db')
const app = express()
app.use(express.json())
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

let db = null

const initializeAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('server running...'))
  } catch (error) {
    console.log(`db error: ${error.message}`)
    process.exit(1)
  }
}
initializeAndServer()

const getFollowingPeopleIdsOfUser = async username => {
  const getTheFollowingPeopleQuery = `
  SELECT 
  following_user_id FROM follower
  INNER JOIN user ON user.user_id=follower.follower_user_id
  WHERE user.username='${username}';`

  const followingPeople = await db.all(getTheFollowingPeopleQuery)
  const arrayOfIds = followingPeople.map(i => i.following_user_id)
  return arrayOfIds
}
//authenticateToken created by middleware
const authenticateToken = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (authHeader) {
    jwtToken = authHeader.split(' ')[1]
  }
  if (jwtToken) {
    jwt.verify(jwtToken, 'SECRET_KEY', (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        request.username = payload.username
        request.userId = payload.userId
        next()
      }
    })
  } else {
    response.status(401)
    response.send('Invalid JWT Token')
  }
}

//Tweet access verification
const tweetAccessVerification = async (request, response, next) => {
  const {userId} = request
  const {tweetId} = request.params
  const getTweetQuery = `
select 
* 
from
tweet INNER JOIN follower ON tweet.user_id=follower.following_user_id
WHERE
tweet.tweet_id ='${tweetId}' AND follower_user_id='${userId}';`
  const tweet = await db.get(getTweetQuery)
  if (tweet === undefined) {
    response.status(401)
    response.send('Invalid Request')
  } else {
    next()
  }
}
//API 1

app.post('/register/', async (request, response) => {
  const {username, password, name, gender} = request.body

  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser !== undefined) {
    response.status(400)

    response.send('User already exists')
  } else {
    if (password.length < 6) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      const createUserQuery = `
      INSERT INTO 
        user (username,password,name, gender) 
      VALUES 
        (
          '${username}', 
          
          '${hashedPassword}', 
          '${name}',
          '${gender}'
         
        )`
      await db.run(createUserQuery)

      response.send('User created successfully')
    }
  }
})
//API 2
app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser !== undefined) {
    const isPasswordCorrect = await bcrypt.compare(password, dbUser.password)
    if (isPasswordCorrect) {
      const payload = {username, userId: dbUser.user_id}
      const jwtToken = jwt.sign(payload, 'SECRET_KEY')
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  } else {
    response.status(400)
    response.send('Invalid user')
  }
})

//API3
app.get('/user/tweets/feed/', authenticateToken, async (request, response) => {
  const {username} = request
  const followingPeopleIds = await getFollowingPeopleIdsOfUser(username)

  const getStateQuery = `
    SELECT
    username,tweet, date_time as dateTime
    FROM
    user
   INNER JOIN tweet ON user.user_id = tweet.user_id
   WHERE
   user.user_id IN (${followingPeopleIds})
   ORDER BY date_time DESC
   LIMIT 4;`

  const tweets = await db.all(getStateQuery)
  response.send(tweets)
})

//API 4
app.get('/user/following/', authenticateToken, async (request, response) => {
  const {username, userId} = request

  const getStateQuery = `
SELECT name FROM follower
INNER JOIN user ON user.user_id = follower.following_user_id

WHERE
follower_user_id ='${userId}';`

  const followingPeople = await db.all(getStateQuery)
  response.send(followingPeople)
})

//API 5
app.get('/user/followers/', authenticateToken, async (request, response) => {
  const {username, userId} = request
  const getDistrictQuery = `
    SELECT DISTINCT name FROM follower
    INNER JOIN user ON user.user_id = follower.follower_user_id
    WHERE following_user_id ='${userId}';`
  const district = await db.all(getDistrictQuery)
  response.send(district)
})
//API 6
app.get(
  '/tweets/:tweetId/',
  authenticateToken,
  tweetAccessVerification,
  async (request, response) => {
    const {username, userId} = request
    const {tweetId} = request.params
    const getDistrictQuery = `
    SELECT 
    tweet,
    (SELECT COUNT() FROM like WHERE tweet_id ='${tweetId}')AS likes,
    (SELECT COUNT() FROM reply WHERE tweet_id = '${tweetId}') AS replies,
    date_time AS dateTime
    FROM tweet
    WHERE tweet.tweet_id = '${tweetId}';`
    const district = await db.get(getDistrictQuery)
    response.send(district)
  },
)

//API 7
app.get(
  '/tweets/:tweetId/likes/',
  authenticateToken,
  tweetAccessVerification,
  async (request, response) => {
    const {tweetId} = request.params
    const getDistrictQuery = `
    SELECT 
    username FROM user INNER JOIN like ON user.user_id= like.user_id
    
    WHERE tweet_id = '${tweetId}';`
    const district = await db.all(getDistrictQuery)
    const tweets = district.map(i => i.username)
    response.send({likes: tweets})
  },
)
//API 8
app.get(
  '/tweets/:tweetId/replies/',
  authenticateToken,
  tweetAccessVerification,
  async (request, response) => {
    const {tweetId} = request.params
    const getDistrictQuery = `
    SELECT 
    name, reply FROM user INNER JOIN reply ON user.user_id= reply.user_id
    
    WHERE tweet_id = '${tweetId}';`
    const district = await db.all(getDistrictQuery)

    response.send({replies: district})
  },
)
//API 9
app.get(
  '/user/tweets/',
  authenticateToken,

  async (request, response) => {
    const {userId} = request
    const getDistrictQuery = `
    SELECT 
    tweet,
     COUNT(DISTINCT like_id) AS likes,
     COUNT(DISTINCT reply_id)AS replies,
    date_time AS dateTime
    FROM tweet LEFT JOIN reply ON tweet.tweet_id = reply.tweet_id LEFT JOIN like ON tweet.tweet_id =like.tweet_id
    WHERE tweet.user_id = ${userId}
    GROUP BY tweet.tweet_id;`
    const district = await db.all(getDistrictQuery)
    response.send(district)
  },
)
//API 10
app.post('/user/tweets/', authenticateToken, async (request, response) => {
  const {tweet} = request.body
  const userId = parseInt(request.userId)
  const dateTime = new Date().toJSON().substring(0, 19).replace('T', ' ')

  const postDistrictQuery = `
    INSERT INTO
    tweet (tweet, user_id, date_time)
    VALUES
    ('${tweet}', '${userId}', '${dateTime}')`

  await db.run(postDistrictQuery)
  response.send('Created a Tweet')
})

//API 11

app.delete(
  '/tweets/:tweetId/',
  authenticateToken,
  async (request, response) => {
    const {tweetId} = request.params
    const {userId} = request
    const getTheTweetQuery = `
    SELECT * FROM tweet WHERE user_id='${userId}' AND tweet_id='${tweetId}';`
    const tweet = await db.get(getTheTweetQuery)

    if (tweet === undefined) {
      response.status(401)
      response.send('Invalid Request')
    } else {
      const deletetDistrictQuery = `
  DELETE FROM
  
  tweet 
  WHERE
  tweet_id ='${tweetId}';`
      await db.run(deletetDistrictQuery)
      response.send('Tweet Removed')
    }
  },
)

module.exports = app
