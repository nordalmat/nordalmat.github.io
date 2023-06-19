document.addEventListener('DOMContentLoaded', () => {
    const likeBtn = document.querySelector('#likeBtn');
    const likesCount = document.querySelector('#likesCount');

    const commentSubmitButton = document.querySelector('#submitButton');
    const commentsCount = document.querySelector('#commentsCount');
    const commentSection = document.querySelector('#commentSection');
    var deleteCommentBtn = document.querySelectorAll('#deleteCommentBtn');
    var editCommentBtn = document.querySelectorAll('#editCommentBtn');

    const postId = document.querySelector('#postCard').getAttribute('data-id');
    const commentBody = document.querySelector('#id_body');

    const submitButton = document.querySelector('#submitButton');
    var editTextareaBodies = document.querySelectorAll('textarea[type="text"]');

    var getRepliesBtn = document.querySelectorAll('#openRepliesBtn')
    console.log(getRepliesBtn)

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

    function addDeleteBtnEventListeners(deleteCommentBtn) {
      deleteCommentBtn.forEach(elem => elem.addEventListener('click', (event) => {
        const commentId = event.target.getAttribute('data-comment-id');
        fetch('delete-comment/', {
            body: JSON.stringify({'post_id': postId, 'comment_id': commentId}),
            method: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            mode: 'same-origin'
        })
        .then((response) => response.json())
        .then((data) => {
            commentsCount.textContent = data.commentsCount;
            const elem = document.getElementById(commentId);
            elem.remove();
        });
      }));
    };

    function addEditBtnEventListeners(editCommentBtn) {
      editCommentBtn.forEach(elem => elem.addEventListener('click', (event) => {
        const commentId = event.target.getAttribute('data-comment-id');
        const body = document.querySelector(`#body${commentId}`).value;
        fetch('edit-comment/', {
            body: JSON.stringify({'body': body, 'comment_id': commentId}),
            method: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            mode: 'same-origin'
        })
        .then((response) => response.json())
        .then((data) => {
            const commentElemText = document.getElementById(`commentBodyId${commentId}`);
            commentElemText.textContent = data.newBody;
        });
      }));
    };

    function enableDisableSubmit(commentBody, submitButton) {
      if(commentBody.value.length === 0) {
        submitButton.disabled = true;
      } else {
        submitButton.disabled = false;
      };
    }

    enableDisableSubmit(commentBody, submitButton);


    // function addOpenRepliesBtnEventListeners(openReplyBtn) {
    //   openReplyBtn.forEach(elem => elem.addEventListener('click', (event) => {
    //     console.log('click')
    //     const commentId = event.target.getAttribute('data-comment-id');
    //     getRepliesBtn = document.querySelectorAll('#openRepliesBtn')
    //     if(document.getElementById(`nestedComments${commentId}`)) {
    //       console.log(document.getElementById(`nestedComments${commentId}`))
    //     } else {
    //       const underCommentSection = document.getElementById(`${commentId}`) 
    //       const html = `
    //       <div id="nestedComments${commentId}">
    //         <div class="row">
    //           <div id="div_id_reply_body${commentId}" class="form-group">
    //             <label for="id_body" class=" requiredField">Body<span class="asteriskField">*</span></label>
    //             <div>
    //               <textarea name="body" cols="40" rows="10" class="textarea form-control" required="" id="id_body"></textarea>
    //             </div>
    //           </div>
    //         </div>
    //         <div class="row align-items-center justify-content-end mb-3">
    //           <input class="button" id="submitButton" type="submit" value="Submit"="">
    //         </div>
    //       </div>
    //       `
    //       underCommentSection.innerHTML += html;
    //     }
    //       // fetch('get-replies/', {
    //       //   body: JSON.stringify({'comment_id': commentId, 'body': commentBody.value}),
    //       //   method: 'POST',
    //       //   headers: {'X-CSRFToken': csrftoken},
    //       //   mode: 'same-origin'
    //       // });
    //     };
    //   }));
    // };

    function addTextareaBodiesEventListeners() {
      editTextareaBodies = document.querySelectorAll('textarea[type="text"]');
      editTextareaBodies.forEach(editTextareaBody => editTextareaBody.addEventListener('keyup', () => {
        const editBtn = document.querySelectorAll(`[id="editCommentBtn"][data-comment-id="${editTextareaBody.getAttribute('data-comment-id')}"]`)[0];
        enableDisableSubmit(editTextareaBody, editBtn);
      }));
    };

    function addCommentBodyEventListeners() {
      commentBody.addEventListener('keyup', () => {
        enableDisableSubmit(commentBody, submitButton);
      });
    };

    editTextareaBodies.forEach((editTextareaBody) => {
      const editBtn = document.querySelectorAll(`[id="editCommentBtn"][data-comment-id="${editTextareaBody.getAttribute('data-comment-id')}"]`)[0];
      enableDisableSubmit(editTextareaBody, editBtn);
    });

    likeBtn.addEventListener('click', () => {
        fetch('like/', {
            body: JSON.stringify({'post_id': postId}),
            method: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            mode: 'same-origin'
        })
        .then((response) => response.json())
        .then((data) => {
            likesCount.textContent = data.likesCount;
        });
        const name = likeBtn.getAttribute('name') === 'heart-outline' ? 'heart': 'heart-outline';
        likeBtn.setAttribute('name', name);
      });

    commentSubmitButton.addEventListener('click', () => {
        fetch('add-comment/', {
            body: JSON.stringify({'post_id': postId, 'body': commentBody.value}),
            method: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            mode: 'same-origin'
        })
        .then((response) => response.json())
        .then((data) => {
            commentsCount.textContent = data.commentsCount;
            const html = `
            <div class="comment horizontal d-md-flex mt-2" id="${data.commentId}">
              <div class="text">
                <div class="meta">
                  <span><a href='#'>${data.name}</a></span>
                  <span>&bullet;</span>
                  <span>just now</span>
                </div>
                <p id="commentBodyId${data.commentId}">${data.commentBody}</p>
              </div>
              <div class="settings d-flex ms-auto">
                  <div class="dropdown">
                    <ion-icon id="dropdownMenuButton" class="dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" name="ellipsis-vertical-outline"></ion-icon>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                      <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editModal${data.commentId}">Edit</a>
                      <a class="dropdown-item red" data-bs-toggle="modal" data-bs-target="#deleteModal${data.commentId}">Delete</a>
                    </div>
                  </div>
              </div>
            </div>
            <div class="modal fade" id="deleteModal${data.commentId}" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
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
                    <a type="button" id="deleteCommentBtn" data-comment-id="${data.commentId}" class="btn btn-primary" data-bs-dismiss="modal">Delete</a>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal fade" id="editModal${data.commentId}" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
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
                        <textarea type="text" class="textarea form-control" id="body${data.commentId}" data-comment-id="${data.commentId}">${data.commentBody}</textarea>
                      </div>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" id="editCommentBtn" data-comment-id="${data.commentId}" class="btn btn-primary" data-bs-dismiss="modal">Save</button>
                  </div>
                </div>
              </div>
            </div>
            `;
            commentSection.innerHTML = html + commentSection.innerHTML;
            commentBody.value = '';
            submitButton.disabled = true;
            deleteCommentBtn = document.querySelectorAll('#deleteCommentBtn');
            editCommentBtn = document.querySelectorAll('#editCommentBtn');
            addDeleteBtnEventListeners(deleteCommentBtn);
            addEditBtnEventListeners(editCommentBtn);
            addTextareaBodiesEventListeners();
        });
    });



    addDeleteBtnEventListeners(deleteCommentBtn);
    addEditBtnEventListeners(editCommentBtn);
    addTextareaBodiesEventListeners();
    addCommentBodyEventListeners();
});

