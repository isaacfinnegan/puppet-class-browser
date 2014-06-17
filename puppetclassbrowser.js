function loadClassFile(tree, node, idx, e)
{
    if (node.get('classname') == undefined || node.get('classname') == "")
    {
        node.expand();
        return false;
    }
    var classviewer = Ext.getCmp('classviewer');
    var codeview;
    var foundview = classviewer.items.findIndex('title', node.data.manifest)
    if (foundview != -1)
    {
        classviewer.setActiveTab(foundview);
        codeview = classviewer.getActiveTab();
    }
    else
    {
        var codeview = classviewer.add(
        {
            xtype: 'panel',
            title: node.data.manifest,
            autoScroll: true,
            closable: true
        });
        classviewer.setActiveTab(codeview);
    }
    // if(  false && Ext.getCmp('filepath').getText()==node.data.manifest)
    // {
    //  gotoClass(node.data.classname)          
    // }
    // else
    // {
    // Ext.getCmp('filepath').setText(node.data.manifest);
    Ext.Ajax.request(
    {
        url: node.data.manifest,
        classname: node.data.classname,
        callback: function(o, s, r)
        {
            r.responseText = '<pre class="brush: puppet">' + r.responseText + '</pre>';
            codeview.body.update(r.responseText);
            var lines = r.responseText.split("\n");

            // find the class line and the line of the next class (or EOF)
            var classlines = [];
            for (var ii = 0; ii < lines.length; ii++)
            {
                var match = "class " + o.classname + " ";
                if (lines[ii] && lines[ii].match(match))
                {
                    classlines.push(ii + 1);
                    continue;
                }
                if (classlines.length)
                {
                    if (lines[ii] && lines[ii].match(/^class/))
                    {
                        break;
                    }
                    classlines.push(ii + 1);
                }
            }
            SyntaxHighlighter.defaults['auto-links'] = false;
            SyntaxHighlighter.defaults['highlight'] = classlines;
            SyntaxHighlighter.highlight();
            linkify_classes();
            gotoClass(o.classname)
        }

    });
    // }

}

function gotoClass(id)
{
    var classpanel = Ext.getCmp('classviewer').getActiveTab();
    var classlines = Ext.query('code.puppetclass', classpanel.body.dom);
    var el = null;
    for (var ii = 0; ii < classlines.length; ii++)
    {
        if (classlines[ii].childNodes && classlines[ii].childNodes[0].textContent == "class " + id)
        {
            el = classlines[ii];
        }
    }
    if (el == null)
    {
        return;
    }
    if (el)
    {
        var top = (Ext.fly(el).getOffsetsTo(classpanel.body)[1]) + classpanel.body.dom.scrollTop;
        classpanel.body.scrollTo('top', top,
        {
            duration: .5
        });
        // classpanel.body.scrollTo('top', top, {duration:.5, callback: function(){
        //          Ext.fly(el).highlight('8DB2E3', {duration: 1500,delay:100});
        //       }});
    }
}

function setupClassrefs(txt)
{
    var list = txt.split("\n");
    var classrefs = {};
    for (var ll = 0; ll < list.length; ll++)
    {
        var segs = i.split('---');
        if (segs.length < 2 || list[ll].length == 0)
        {
            continue;
        }
        if (typeof classrefs[segs[0]] == 'undefined')
        {
            classrefs[segs[0]] = [];
        }
        classrefs[segs[0]].push(segs[1]);
    }
}

function loadClasses()
{
    var classes = [];
    var keys = Object.keys(class_data).sort();
    for (var ll = 0; ll < keys.length; ll++)
    {
        try
        {
            var classname_astext = keys[ll];
            var classname = classname_astext.split('::');
            // console.log(ll + " : " + segs[0]);
            if (classname.length == 1)
            {
                classes.push(
                {
                    iconCls: 'puppetclass',
                    text: classname[0],
                    classname: classname_astext,
                    manifest: class_data[classname_astext]['source'],
                    leaf: true,
                    children: [],
                    tipconfig: makeClassTooltip(class_data[classname_astext])
                });
            }
            else
            {
                var currentNode = classes[getChildIndex(classname[0], classes, class_data[classname_astext]['source'], keys[ll])];
                if (classname.length > 2)
                {
                    // loop through classname segments and create nodes
                    for (var ii = 1; ii < classname.length - 1; ii++)
                    {
                        currentNode.leaf = false;
                        currentNode = currentNode.children[getChildIndex(classname[ii], currentNode.children, class_data[classname_astext]['source'])];
                    }
                }
                currentNode.leaf = false;
                currentNode.children.push(
                {
                    iconCls: 'puppetclass',
                    text: classname[classname.length - 1],
                    classname: classname_astext,
                    manifest: class_data[classname_astext]['source'],
                    leaf: true,
                    children: [],
                    tipconfig: makeClassTooltip(class_data[classname_astext])
                }); //,id: segs[0]});

            }
        }
        catch (err)
        {
            console.log(err);
        }
    }
    console.log(classes);
    Ext.getCmp('classtree').getRootNode().appendChild(classes);
}

function makeClassTooltip(cls)
{
    if (typeof cls['refs'] == 'undefined')
    {
        return undefined;
    }
    var rtn = '';
    var sorted = cls['refs'].sort();
    for (var i in sorted)
    {
        rtn += "<a class='tooltipclasslink' onclick='lkupClass(\"" + sorted[i] + "\")' rel='nofollow'>" + sorted[i] + "</a><br />";
    }
    return {
        title: "<i>referenced by:</i> <br>",
        html: rtn,
        anchor: 'left',
        hideDelay: 2000,
        showDelay: 250
    };
}

function getChildIndex(item, arr, file, fullname)
{
    var found = -1;
    Ext.each(arr, function(i, idx)
    {
        if (i.text == item)
        {
            found = idx;
            return false;
        }
    });
    if (found == -1)
    {
        found = arr.push(
        {
            iconCls: 'folder',
            text: item,
            manifest: file,
            leaf: true,
            children: [],
            classname: undefined
        }); //,id:fullname});
        found--;;
    }
    return found;
}

function linkify_classes()
{
    var lines = Ext.query('td.code', Ext.getCmp('classviewer').getActiveTab().body.dom)[0].childNodes[0].childNodes;
    for (var i = 0; i < lines.length; i++)
    {
        for (var c = 0; c < lines[i].childNodes.length; c++)
        {
            if (lines[i].childNodes[c].className && lines[i].childNodes[c].className.match('puppetclass') != null)
            {
                var config = makeClassTooltip(class_data[lines[i].childNodes[c].textContent.replace(/\s*class\s*/, '')])
                if (config)
                {
                    config.target = lines[i].childNodes[c];
                    Ext.create('Ext.tip.ToolTip', config);
                }
            }
            if (lines[i].childNodes[c].textContent == 'include')
            {
                var includename = lines[i].childNodes[c + 2].textContent;
                lines[i].childNodes[c + 2].textContent = '';
                Ext.DomHelper.append(lines[i].childNodes[c + 2],
                {
                    tag: 'a',
                    class: 'classLink',
                    onClick: "lkupClass(\'" + includename + "\')",
                    rel: "nofollow",
                    html: includename
                });
                // lines[i].childNodes[c+1].textContent=' <a class=classLink onClick="lkupClass(\'' + includename + '\')" rel="nofollow" >'+ includename +'</a>'

            }
        }
    }
    return;

    // if( !text ) return text;

    // text = text.replace(/^(class\s[:\w\-]+)/gmi,function(classtxt){
    //  segs = classtxt.split(' ');
    //  return '<a class=classAnchor id="'+ segs[1] +'"></a><h4>' + classtxt + '</h4>';
    // });
    // text = text.replace(/((include|inherits)\s+[:\w\-0-9]+)/gi,function(classtxt){
    //  segs = classtxt.split(' ');
    //  return segs[0] + ' <a class=classLink onClick="lkupClass(\'' + segs[1] + '\')" rel="nofollow" >'+ segs[1] +'</a>';
    // });

    // return text;
}

function lkupClass(id)
{
    var tree = Ext.getCmp('classtree');
    id = id.replace(/^::/, '');
    var node = findChildRecursively(tree.getRootNode(), 'classname', id);
    if (node)
    {
        tree.selectPath(node.getPath('text'), 'text');
        // node.select();
        // loadClassFile(node);
    }
}

function findChildRecursively(tree, attribute, value)
{
    var cs = tree.childNodes;
    for (var i = 0, len = cs.length; i < len; i++)
    {
        if (cs[i].data[attribute] == value)
        {
            return cs[i];
        }
        else
        {
            // Find it in this tree 
            if (found = findChildRecursively(cs[i], attribute, value))
            {
                return found;
            }
        }
    }
    return null;
}