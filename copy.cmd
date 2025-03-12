ssh -l ubuntu allchat.online "docker exec autocode_mongo_1 mongoexport --db autocode --type csv --collection users --fields _id,email,tier,subscriptionStatus,stripeSubscriptionId,stripeCustomerId,ip,devices,tier,dailyRequests >users.csv"
ssh -l ubuntu allchat.online "docker exec autocode_mongo_1 mongoexport --db autocode --type csv --collection inquiries --fields _id,email,name,message,status >inquiries.csv"
scp ubuntu@allchat.online:/home/ubuntu/users.csv . 
scp ubuntu@allchat.online:/home/ubuntu/inquiries.csv . 
