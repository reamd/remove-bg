# FROM node:18-alpine as builder  

# WORKDIR /usr/src/app  

# COPY package*.json ./  

# RUN npm install  

# COPY . .  

# RUN npm run build  


FROM nginx:alpine

# COPY nginx.conf /etc/nginx/nginx.conf  

COPY ./build /usr/share/nginx/html  

EXPOSE 80  

CMD ["nginx", "-g", "daemon off;"]
