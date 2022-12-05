FROM node:19.2.0-alpine

WORKDIR /app

# Install Node dependencies
WORKDIR /app/react_app
ENV PATH /app/react_app/node_modules/.bin:$PATH
COPY react_app/package.json ./
COPY react_app/yarn.lock ./
RUN yarn install

WORKDIR /app

# Install python/pip and dependencies
RUN apk update \
  && apk add build-base
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3-dev && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
COPY requirements.txt ./
RUN pip3 install -r requirements.txt

COPY . ./

# URL for genesearch api
ENV GENESEARCH_URL=http://lb.genesearch.production.svc.spin.nersc.org/api/v1/
# URL for sequence-search UI
ENV PUBLIC_URL=https://narrative-dev.kbase.us/sequence-search/

CMD ["sh","./scripts/start.sh"]
