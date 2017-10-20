sitehound_version="5.3.6"
docker build --tag hyperiongray/sitehound:$sitehound_version .
docker push hyperiongray/sitehound:$sitehound_version

# to set different properties
# docker run -d -p 0.0.0.0:5081:5081 --name=sitehound-$sitehound_version -v settings_prod.py:/root/sitehound/ui/settings.py --hostname=sitehound --link mongodb:mongodb --link kafkacontainer:hh-kafka --link elasticsearch:hh-elasticsearch docker.hyperiongray.com/sitehound:$sitehound_version

#docker run -d -p 0.0.0.0:5081:5081 --name=sitehound-$sitehound_version --hostname=sitehound --link mongodb:mongodb --link kafka-2.11-0.10.1.1-2.4:hh-kafka --link elasticsearch:hh-elasticsearch hyperiongray/sitehound:$sitehound_version
#docker run -d -p 0.0.0.0:5082:5081 --name=sitehound-$sitehound_version --hostname=sitehound5082 --link mongodb:mongodb --link kafka-2.11-0.10.1.1-2.4:hh-kafka --link elasticsearch:hh-elasticsearch hyperiongray/sitehound:$sitehound_version
