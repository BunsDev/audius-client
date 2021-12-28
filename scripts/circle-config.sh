if circleci version ; then
    circleci config pack .circleci/src > .circleci/continue_config.yml
    circleci config validate .circleci/continue_config.yml
else
    echo "Install the circleci cli with 'brew install circleci'"
fi