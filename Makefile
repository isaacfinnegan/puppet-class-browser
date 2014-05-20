NAME=puppet-class-browser
VERSION=1.5.0
RELEASE=1
SOURCE=$(NAME)-$(VERSION).tar.gz
EXES=
LIBS=
CONFS=
FILES= pkg.gif collapse-all.gif	shBrushPuppet.js shCore.css expand-all.gif shCore.js extjs shThemeDefault.css hd-bg.gif	update_class_list.sh index.html	ux
ARCH=noarch
PREFIX=/var/www/puppet-class-browser
CLEAN_TARGETS=$(SPEC) $(NAME)-$(VERSION) $(SOURCE) # for in-house package

include $(shell starter)/rules.mk
