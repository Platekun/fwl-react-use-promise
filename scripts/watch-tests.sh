#!/bin/bash

GREEN="\033[0;32m";
END_COLOR="\033[0m";

function avalog() {
  message=${1};

  echo -e "${GREEN}[Avalon]${END_COLOR} - $(date +"%m-%d-%Y, %r") - ${message}";
}

function bootstrap() {
  avalog "${GREEN}🚥 Running tests...${END_COLOR}";

  # ███████╗███████╗████████╗██╗   ██╗██████╗ 
  # ██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
  # ███████╗█████╗     ██║   ██║   ██║██████╔╝
  # ╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝ 
  # ███████║███████╗   ██║   ╚██████╔╝██║     
  # ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝

  projectName="fwl-react-use-promise";
  testImageName="${projectName}-test-image";
  testDockerFilePath="./docker/watch-tests.Dockerfile";
  testContainerName="${projectName}-test-container";
  sourceCodePath="$(pwd)/library";
  sourceCodePathWorkdir="/${projectName}";

  # Git volume.
  gitVolumePath="$(pwd)/.git";
  gitContainerPath="/${projectName}/.git";

  # ███████╗██╗  ██╗███████╗ ██████╗██╗   ██╗████████╗██╗ ██████╗ ███╗   ██╗
  # ██╔════╝╚██╗██╔╝██╔════╝██╔════╝██║   ██║╚══██╔══╝██║██╔═══██╗████╗  ██║
  # █████╗   ╚███╔╝ █████╗  ██║     ██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║
  # ██╔══╝   ██╔██╗ ██╔══╝  ██║     ██║   ██║   ██║   ██║██║   ██║██║╚██╗██║
  # ███████╗██╔╝ ██╗███████╗╚██████╗╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║
  # ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

  # Pre-execution cleanup.
  docker container rm ${testContainerName} &> /dev/null;
  docker image rm ${testImageName} &> /dev/null;

  # Create an image to run a "start development mode" command.
  docker image build \
    --file ${testDockerFilePath} \
    --tag ${testImageName} \
    .;

  # Create an image to run a "run tests" command.
  docker container run \
    --rm \
    --interactive \
    --tty \
    -v ${sourceCodePath}:${sourceCodePathWorkdir} \
    -v ${gitVolumePath}:${gitContainerPath} \
    --name ${testContainerName} \
    ${testImageName};

  # Post-execution cleanup
  docker image rm ${testImageName} &> /dev/null;
}

bootstrap $@;
