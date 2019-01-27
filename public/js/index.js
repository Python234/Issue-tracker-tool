'use strict'

$( document ).ready(() => {
  
  let currentProject = '';
  
  
  // CREATE NEW PROJECT REQUEST
  $('#new-project').on('submit', e => {
    e.preventDefault();
    
    const formData = { project_name: e.target.project_name.value };
    
    $.ajax({
      method: 'POST',
      contentType: 'application/json',
      url: window.location + 'api/issues/new_project',
      data: JSON.stringify(formData),
      dataType: 'json',
      success: data => { 
        if (currentProject === '') {
          $('h1').addClass('float');
          $('#list-link').append('<a>List all issues</a>');
        };
        
        $('h1').text(data.project_name.toUpperCase() + ' ISSUE TRACKER');
        
        $('ul').append('<li>' + data.project_name + '</li>');
        
        $('a').attr('href', '/api/issues' + data.project_name);
        
        $('#response-container').removeClass('error').addClass('nomal');
        $('#response-text').html(data.responseText);
        
        currentProject = data.project_name;
        e.target.reset();
      },
      error: e => { 
        $('#response-container').removeClass('nomal').addClass('error');
        $('#response-text').html(e.responseText);
      }
    });
  });
  
  // CREATE NEW ISSUE REQUEST
  $('#create').on('submit', e => {
    e.preventDefault();
    if (currentProject !== '') {
      console.log(e.target.assigned_to.value === '' ? undefined : 'isDefined');

      const formData = {
        issue_title: e.target.issue_title.value,
        issue_text:  e.target.issue_text.value,
        created_by:  e.target.created_by.value,
        assigned_to: e.target.assigned_to.value === '' ? undefined : e.target.assigned_to.value,
        status_text: e.target.status_text.value === '' ? undefined : e.target.status_text.value
      };

      $.ajax({
        method: 'POST',
        contentType: 'application/json',
        url: window.location + '/api/issues/' + currentProject,
        data: JSON.stringify(formData),
        dataType: 'json',
        success: data => {
          $('#response-container').removeClass('error').addClass('nomal');
          $('#response-text').html(syntaxHighlight(JSON.stringify(data, null, 2)));

          e.target.reset();
        },
        error: err => {
          $('#response-container').removeClass('nomal').addClass('error');
          $('#response-text').html(err.responseText);
        }
      });
    }
    else {
      $('#response-container').removeClass('nomal').addClass('error');
      $('#response-text').html('Select a project first from the left pane');
    }
  });
  
  // UPDATE ISSUE REQUEST
  $('#update').on('submit', e => {
    e.preventDefault();
    
    if (currentProject !== '') {
      const formData = {
        issue_id:    e.target.issue_id.value,
        issue_title: e.target.issue_title.value == '' ? undefined : e.target.issue_title.value,
        issue_text:  e.target.issue_text.value == '' ? undefined : e.target.issue_text.value,
        created_by:  e.target.created_by.value == '' ? undefined : e.target.created_by.value,
        assigned_to: e.target.assigned_to.value == '' ? undefined : e.target.assigned_to.value,
        status_text: e.target.status_text.value == '' ? undefined : e.target.status_text.value,
        open:        e.target.closed.checked ? false : undefined
      };

      $.ajax({
        method: 'PUT',
        contentType: 'application/json',
        url: window.location + 'api/issues/' + currentProject,
        data: JSON.stringify(formData),
        dataType: 'json',
        success: data => {
          $('#response-container').removeClass('error').addClass('nomal');
          $('#response-text').html(data.responseText);
          
          e.target.reset();
        },
        error: error => {
          $('#response-container').removeClass('nomal').addClass('error');
          $('#response-text').html(error.responseText);
        }
      });
    }
    else {
      $('#response-container').removeClass('nomal').addClass('error');
      $('#response-text').html('Select a project first from the left pane');
    }
  });
  
  // DELETE ISSUE REQUEST
  $('#delete').on('submit', e => {
    e.preventDefault();
    
    if (currentProject !== '') {
      var formData = { issue_id: e.target.issue_id.value };
      
      $.ajax({
        method: 'DELETE',
        contentType: 'application/json',
        url: window.location + '/api/issues/' + currentProject,
        data: JSON.stringify(formData),
        dataType: 'json',
        success: data => {
          if (data.success) {
            $('#response-container').removeClass('error').addClass('nomal');
            $('#response-text').html(syntaxHighlight(JSON.stringify(data, null, 2)));

            e.target.reset();
          }
          else {
            $('#response-container').removeClass('nomal').addClass('error');
            $('#response-text').html(syntaxHighlight(JSON.stringify(data, null, 2)));
          }
        },
        error: error => {
          $('#response-container').removeClass('nomal').addClass('error');
          $('#response-text').html(error.responseText);
        }
      });
    }
    else {
      $('#response-container').removeClass('nomal').addClass('error');
      $('#response-text').html('Select a project first from the left pane');
    }
  });

  function syntaxHighlight(json) {
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
          var cls = 'number';
          if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                  cls = 'key';
              } else {
                  cls = 'string';
              }
          } else if (/true|false/.test(match)) {
              cls = 'boolean';
          } else if (/null/.test(match)) {
              cls = 'null';
          }
          return '<span class="' + cls + '">' + match + '</span>';
      });
  }

  $('ul').on('click', 'li', e => {
    console.log('clicked: ' + e);
    if (currentProject === '') {
      $('h1').addClass('float');
      $('#list-link').append('<a>List all issues</a>');
    }
    
    currentProject = $('#' + e.target.id).text();
    
    $('h1').text(currentProject.toUpperCase() + ' ISSUE TRACKER');
    $('a').attr('href', '/api/issues/' + currentProject);
  });
  
});