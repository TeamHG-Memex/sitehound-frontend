############################################################
# Dockerfile to build Sitehound
# Based on Ubuntu
############################################################

#FROM ubuntu
FROM       hyperiongray/ubuntujava:1.0.0

MAINTAINER Tomas <tfornara@hyperiongray.com>

# Update the sources list
RUN apt-get update

# Install basic applications
RUN apt-get install -y tar git curl wget dialog net-tools build-essential zlib1g-dev

# Install Python and Basic Python Tools
RUN apt-get install -y python python-dev python-distribute python-pip libxml2-dev libxslt-dev

RUN mkdir -p /root/sitehound

# Import the application
ADD ui /root/sitehound/ui
ADD runserver.py /root/sitehound/runserver.py
ADD requirements.txt /root/sitehound/requirements.txt

# in case is needed to replace some config
ADD ui/settings.py /root/sitehound/ui/

# Set the default directory where CMD will execute
WORKDIR /root/sitehound

# Get pip to download and install requirements:
RUN pip install -r /root/sitehound/requirements.txt

# Expose ports
EXPOSE 5081

# env in the ui/ directory
ENV PYTHONPATH=/root/sitehound/ui


# in case is needed to replace some config
ADD ui/settings.py /root/sitehound/ui/

# Set the default command to execute    
# when creating a new container
#CMD python /root/sitehound/runserver.py --logging-file sitehound.log --logging-level info
CMD python /root/sitehound/runserver.py
