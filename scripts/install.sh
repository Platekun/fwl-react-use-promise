#!/bin/bash

GREEN="\033[0;32m";
END_COLOR="\033[0m";

function avalog() {
  message=${1};

  echo -e "${GREEN}[Avalon]${END_COLOR} - $(date +"%m-%d-%Y, %r") - ${message}";
}

function bootstrap() {
  avalog "${GREEN}🧰 Installing project...${END_COLOR}";

  # ███████╗███████╗████████╗██╗   ██╗██████╗ 
  # ██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
  # ███████╗█████╗     ██║   ██║   ██║██████╔╝
  # ╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝ 
  # ███████║███████╗   ██║   ╚██████╔╝██║     
  # ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝

  projectName="fwl-react-use-promise";
  imageName="${projectName}-installation-image";
  dockerFilePath="./docker/install.Dockerfile";
  containerName="${projectName}-installation-container";

  # Node modules.
  nodeModulesPath="$(pwd)/library/node_modules";
  nodeModulesContainerPath="/${projectName}/library/node_modules";

  # ███████╗██╗  ██╗███████╗ ██████╗██╗   ██╗████████╗██╗ ██████╗ ███╗   ██╗
  # ██╔════╝╚██╗██╔╝██╔════╝██╔════╝██║   ██║╚══██╔══╝██║██╔═══██╗████╗  ██║
  # █████╗   ╚███╔╝ █████╗  ██║     ██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║
  # ██╔══╝   ██╔██╗ ██╔══╝  ██║     ██║   ██║   ██║   ██║██║   ██║██║╚██╗██║
  # ███████╗██╔╝ ██╗███████╗╚██████╗╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║
  # ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ 

  # Pre-execution cleanup.
  docker container rm ${containerName} &> /dev/null;
  docker image rm ${imageName} &> /dev/null;

  # Create an image to run a "install project" command.
  docker image build \
    --file ${dockerFilePath} \
    --tag ${imageName} \
    .;

  # Run the "install project" command container.
  docker container run \
    --tty \
    --name ${containerName} \
    ${imageName} \
    "---";

  avalog "💾 Saving your dependencies...";

  # Copy the contents of the source code volume into a new `library` directory.
  docker cp ${containerName}:${nodeModulesContainerPath} ${nodeModulesPath};

  avalog "✨ Done";

  # Post-execution cleanup.
  docker container rm "${containerName}" &> /dev/null;
  docker image rm "${imageName}" &> /dev/null;
}

bootstrap $@; 