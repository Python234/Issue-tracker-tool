const mongoose = require('mongoose');
const shortID  = require('shortid');

module.exports = (db, app) => {
  
  const issueSchema = mongoose.Schema({
    _id: String,
    project_name: String,
    issue_title: String,
    issue_text: String,
    created_by: String,
    assigned_to: String,
    status_text: String,
    created_on: {
      type: Date,
      default: new Date()
    },
    updated_on: {
      type: Date,
      default: new Date()
    },
    open: {
      type: Boolean,
      default: true
    }
  });
  
  const Issue = mongoose.model('Issue', issueSchema);
  
  app.route('/')
     .get((req, res) => {
       db.collection('projects').find().toArray((err, data) => {
         var projects = [];
         data.forEach(project => projects.push(project.project_name));
         res.render(process.cwd() + '/views/index.pug',
                    {doctype: 'html', projects: projects});
       });
    });
  
  // create new project
  app.route('/api/issues/new_project')
     .post((req, res) => {
       let project_name = req.body.project_name.trim().toLowerCase().replace(/\s/g, '_');
       let obj = { project_name: project_name }; 
    
       let projects = db.collection('projects');
    
       projects.findOne(obj, (err, data) => {
         if (err) {
           console.log('Error: ' + err);
           done('Could not create project');
         }
         else if (data != undefined) done('Error: Project with name `' + project_name + '` already exists');
         else projects.insertOne(obj, (err, doc) => {
           if (err) {
             console.log('Error: ' + err);
             done('Could not create project');
           }
           else {
             let responseText = project_name + " created successfuly.";
             console.log(responseText);
             obj.responseText = responseText;
             done(obj);
           }
         });
       }, done);
    
      var done = data => { res.send(data) }
     });
  
  // creating new issue
  app.route('/api/issues/:project_name')
     .post((req, res) => {
    
    const issue = new Issue();
    
    issue._id          = shortID();
    issue.project_name = req.params.project_name;
    issue.issue_title  = req.body.issue_title;
    issue.issue_text   = req.body.issue_text;
    issue.created_by   = req.body.created_by;
    issue.assigned_to  = req.body.assigned_to;
    issue.status_text  = req.body.status_text;
    
    let issues = db.collection('issues');
    
    issues.insertOne(issue, (err, doc) => {
      if (err) res.send('Error: An able to create new issue.');
      else res.json(issue);
    });
  });
  
  // UPDATE ISSUE
  app.route('/api/issues/:project_name')
     .put((req, res) => {
    
    if (Object.keys(req.body).length == 1) res.send('No update fields set')
    else {
      
      const update = {};
      
      Object.entries(req.body).forEach(([key, value]) => {
        if (key != 'issue_id') update[key] = value;
      });
      
      update.updated_on = new Date();
      
      const issues = db.collection('issues');
      issues.findOneAndUpdate(
        {
          _id: req.body.issue_id,
          project_name: req.params.project_name
        },
        {
         $set: update
        },
        (err, doc) => {
          console.log(doc);
          if (err) res.send('Could not update ' + req.body.issue_id);
          else if (!doc) res.send(req.params.project_name + ' has no issue with _id: ' + req.body.issue_id);
          else res.json({ responseText: 'Successfuly updated ' + req.body.issue_id});
        }
      );
      
    }
  });
  
  // DELETE ISSUE
  app.route('/api/issues/:project_name')
     .delete((req, res) => {
    
    if (Object.keys(req.body).length == 0 || req.body.issue_id.trim() == '') res.send('_id error.')
    else {
      const issues = db.collection('issues');
      
      const filter = {
        _id: req.body.issue_id,
        project_name: req.params.project_name
      }
      
      issues.findOneAndDelete(filter, (err, doc) => {
        
        if (err) res.json({ error: 'Could not delete ' + req.body.issue_id });
        else if (!doc.value) res.json({ error: filter._id + ' not in ' + filter.project_name });
        else res.json({ success: 'Deleted ' + filter._id });
        
      })
    }
  });
  
  app.route('/api/issues/:project_name')
     .get((req, res) => {
    
    const issues = db.collection('issues');
      
    const query = {};
    
    Object.keys(req.query).forEach(key => query[key] = req.query[key]);
    Object.keys(req.body).forEach(key => query[key] = req.body[key]);
    query.project_name = req.params.project_name;
    
    issues.find(query).toArray((err, docs) => {
      if (err) res.redirect('/');
      
      const data = [];
      
      docs.forEach(doc => data.push(doc));
      
      res.json(data);
    });
  });
  
  app.use((req, res, next) => {
    res.redirect('/');
  });
}