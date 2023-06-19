function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

const csrftoken = getCookie('csrftoken');
const postId = document.querySelector('#postCard').getAttribute('data-id');

const likesCount = document.querySelector('#likesCount');
const commentsCount = document.querySelector('#commentsCount');


$(function(){
  $('#likeBtn').on('mouseenter', function() {
    $('#likeBtn').attr('name', 'heart');
  });
});

$(function(){
  $('#likeBtn').on('mouseleave', function() {
    $('#likeBtn').attr('name', 'heart-outline');
  });
});

// Like/Unlike
$(function(){
  $('#likeBtn').on('click', function() {
    $.ajax({
      type: 'POST',
      url: 'like/',
      data: JSON.stringify({'post_id': postId}),
      headers: {'X-CSRFToken': csrftoken}
    }).done(function(response) {
      $(likesCount).text(response['likesCount']);
    });
    const name = $('#likeBtn').attr('name') === 'heart-outline' ? 'heart': 'heart-outline';
    $('#likeBtn').attr('name', name);
  });
});

// Post comment
$(function(){
  $('body').on('click', '#mainSubmitCommentButton', function(e) {
    $.ajax({
      type: 'POST',
      url: 'add-comment/',
      data: JSON.stringify({'post_id': postId, 'body': $('#id_body').val()}),
      headers: {'X-CSRFToken': csrftoken}
    }).done(function(response) {
      const commentId = response['commentId']
      const name = response['name'];
      const commentBody = response['commentBody'];
      $(commentsCount).html(response['commentsCount']);
      $('#id_body').val('')
      e.target.disabled = true;
      $('#commentSection').prepend(
      `
      <div class="comment horizontal mt-2" id="${commentId}">
        <div class="row w-100">
          <div class="col-10 px-0">
            <div class="text">
              <div class="meta">
                <span><a href="#">${name}</a></span>
                <span>&bullet;</span>
                <span>just now</span>
              </div>
              <p id="commentBodyId${commentId}">${commentBody}</p>
            </div>
          </div>
          <div class="col-2 d-flex justify-content-end px-0">
            <div class="row">
              <div class="settings d-flex justify-content-end mb-auto px-0">
                  <div class="dropdown">
                    <ion-icon id="dropdownMenuButton" class="dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" name="ellipsis-vertical-outline"></ion-icon>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editCommentModal${commentId}">Edit</a>
                      <a class="dropdown-item red" data-bs-toggle="modal" data-bs-target="#deleteCommentModal${commentId}">Delete</a>
                    </div>
                  </div>
              </div>
              <div class="reply-btn d-flex justify-content-end align-items-end px-0">
                <a class="d-flex align-items-center" id="openRepliesBtn" data-comment-id="${commentId}"><span class="position-relative top-100 start-0 translate-bottom badge rounded-pill bg-light text-dark" id="replyBadge${commentId}">0</span>&nbsp;Reply&nbsp;<ion-icon name="repeat-outline"></ion-icon></a>
              </div>
            </div>
          </div>
        </div>
        <div class="nestedComments" id="nestedComments${commentId}">
          <div class="row">
            <div id="div_id_reply_body${commentId}" class="form-group">
              <label for="id_body" class="requiredField">Body<span class="asteriskField">*</span></label>
              <div>
                <textarea name="body" cols="40" rows="10" class="textarea form-control" required="" id="id_body${commentId}" data-textarea="${commentId}"></textarea>
              </div>
            </div>
          </div>
          <div class="row align-items-center justify-content-end mb-3" id="replyButtonDiv${commentId}">
            <input class="button" id="submitReplyButton" data-comment-id="${commentId}" type="submit" value="Submit" disabled>
          </div>
        </div>
      </div>
      <div class="modal fade" id="deleteCommentModal${commentId}" tabindex="-1" aria-labelledby="deleteCommentModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirm action</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete the comment?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <a type="button" id="deleteCommentBtn" data-comment-id="${commentId}" class="btn btn-primary" data-bs-dismiss="modal">Delete</a>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="editCommentModal${commentId}" tabindex="-1" aria-labelledby="editCommentModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit comment</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="mb-3">
                  <label for="body" class="col-form-label">Body:</label>
                  <textarea type="text" class="textarea form-control" id="body${commentId}" data-edit-comment-id="${commentId}">${commentBody}</textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer" id="editCommentFooter${commentId}">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" id="editCommentBtn" data-comment-id="${commentId}" class="btn btn-primary" data-bs-dismiss="modal">Save</button>
            </div>
          </div>
        </div>
      </div>
      `
      );
    });
  });
});

// Delete comment
$(function(){
  $('body').on('click', '#deleteCommentBtn', function(e) {
    const commentId = e.target.getAttribute('data-comment-id');
    $.ajax({
      type: 'POST',
      url: 'delete-comment/',
      data: JSON.stringify({'post_id': postId, 'comment_id': commentId}),
      headers: {'X-CSRFToken': csrftoken}
    }).done(function(response) {
      $(`#${commentId}`).remove()
      $(commentsCount).html(response['commentsCount'])
    });
  });
});

// Edit comment
$(function(){
  $('body').on('click', '#editCommentBtn', function(e) {
    const commentId = e.target.getAttribute('data-comment-id');
    $.ajax({
      type: 'POST',
      url: 'edit-comment/',
      data: JSON.stringify({'comment_id': commentId, 'body': $(`#body${commentId}`).val()}),
      headers: {'X-CSRFToken': csrftoken}
    }).done(function(response) {
      $(`#commentBodyId${response['commentId']}`).text(response['newBody'])
    });
  });
});

// Open replies
$(function(){
    $('body').on('click', '#openRepliesBtn', function(e) {
        const commentId = e.target.getAttribute('data-comment-id')
        $(`#nestedComments${commentId}`).toggle();
    });
});

// Post reply
$(function(){
    $('body').on('click', '#submitReplyButton', function(e) {
        const commentId = e.target.getAttribute('data-comment-id')
        $.ajax({
            type: 'POST',
            url: 'add-reply/',
            data: JSON.stringify({'comment_id': commentId, 'body': $(`#id_body${commentId}`).val()}),
            headers: {'X-CSRFToken': csrftoken}
        }).done(function(response) {
            const replyId = response['replyId']
            const name = response['name']
            const replyBody = response['replyBody']
            e.target.disabled = true;  
            $(`#replyButtonDiv${commentId}`).after(
            `
            <div class="reply horizontal mt-2" id="${replyId}">
              <div class="row w-100">
                <div class="col-10 px-0">
                  <div class="text">
                    <div class="meta">
                      <span><a href="#">${name}</a></span>
                      <span>&bullet;</span>
                      <span>just now</span>
                    </div>
                    <p id="replyBodyId${replyId}">${replyBody}</p>
                  </div>
                </div>
                <div class="col-2 d-flex justify-content-end px-0">
                  <div class="row">
                    <div class="settings d-flex justify-content-end mb-auto px-0">
                        <div class="dropdown">
                          <ion-icon id="dropdownMenuButton" class="dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" name="ellipsis-vertical-outline"></ion-icon>
                          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editReplyModal${replyId}">Edit</a>
                            <a class="dropdown-item red" data-bs-toggle="modal" data-bs-target="#deleteReplyModal${replyId}">Delete</a>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div> 
            </div>
            <div class="modal fade" id="deleteReplyModal${replyId}" tabindex="-1" aria-labelledby="deleteReplyModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Confirm action</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <p>Are you sure you want to delete the reply?</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <a type="button" id="deleteReplyBtn" data-reply-id="${replyId}" class="btn btn-primary" data-bs-dismiss="modal">Delete</a>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal fade" id="editReplyModal${replyId}" tabindex="-1" aria-labelledby="editReplyModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Edit reply</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <form>
                      <div class="mb-3">
                        <label for="body" class="col-form-label">Body:</label>
                        <textarea type="text" class="textarea form-control" id="bodyReply${replyId}" data-edit-reply-id="${replyId}">${replyBody}</textarea>
                      </div>
                    </form>
                  </div>
                  <div class="modal-footer" id="editReplyFooter${replyId}">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" id="editReplyBtn" data-reply-id="${replyId}" class="btn btn-primary" data-bs-dismiss="modal">Save</button>
                  </div>
                </div>
              </div>
            </div>
            `
            )
            $(`#id_body${commentId}`).val('');
            let num = +$(`#replyBadge${commentId}`).html() + 1;
            $(`#replyBadge${commentId}`).html(num);
        });
    });
});

// Delete reply
$(function(){
  $('body').on('click', '#deleteReplyBtn', function(e) {
    const replyId = e.target.getAttribute('data-reply-id');
    $.ajax({
      type: 'POST',
      url: 'delete-reply/',
      data: JSON.stringify({'reply_id': replyId}),
      headers: {'X-CSRFToken': csrftoken}
    }).done(function(response) {
      const commentId = response['commentId']
      $(`#${replyId}`).remove()
      let num = +$(`#replyBadge${commentId}`).html() - 1;
      $(`#replyBadge${commentId}`).html(num);
    });
  });
});

// Edit reply
$(function(){
  $('body').on('click', '#editReplyBtn', function(e) {
    const replyId = e.target.getAttribute('data-reply-id');
    console.log($(`#bodyReply${replyId}`).val())
    $.ajax({
      type: 'POST',
      url: 'edit-reply/',
      data: JSON.stringify({'reply_id': replyId, 'body': $(`#bodyReply${replyId}`).val()}),
      headers: {'X-CSRFToken': csrftoken}
    }).done(function(response) {
      $(`#replyBodyId${response['replyId']}`).text(response['newBody'])
    });
  });
});

// Disable/Enable Submit buttons
const mainSubmitButton = document.getElementById('mainSubmitCommentButton')

function enableDisableSubmit(submitButton, commentBody) {
  if(commentBody.val().length === 0) {
    submitButton.prop('disabled', true)
  } else {
    submitButton.prop('disabled', false)
  };
};

// Main submit
$(function(){
  $('#id_body').on('keyup', function() {
    enableDisableSubmit($('#mainSubmitCommentButton'), $('#id_body'))
  });
});
enableDisableSubmit($('#mainSubmitCommentButton'), $('#id_body'))

// Reply submit
$(function(){
  $('body').on('keyup', '[data-textarea]', function(e){
    const commentId = e.target.getAttribute('data-textarea')
    const btn = $(`#replyButtonDiv${commentId}`).children().first()
    enableDisableSubmit(btn, $(e.target))
  })
});

// Edit Comment submit
$(function(){
  $('body').on('keyup', '[data-edit-comment-id]', function(e){
    console.log('in')
    const commentId = e.target.getAttribute('data-edit-comment-id')
    const btn = $(`#editCommentFooter${commentId}`).children().last()
    console.log(btn);
    enableDisableSubmit(btn, $(e.target))
  });
});

// Edit Reply submit
$(function(){
  $('body').on('keyup', '[data-edit-reply-id]', function(e){
    const replyId = e.target.getAttribute('data-edit-reply-id')
    const btn = $(`#editReplyFooter${replyId}`).children().last()
    enableDisableSubmit(btn, $(e.target))
  });
});
