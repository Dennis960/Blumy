import pysftp
import os
import sys
import subprocess

local_path = os.path.dirname(os.path.realpath(__file__)).replace('\\', '/')
remote_path = '/var/www/hoppingadventure/hopping/esplant'
backend_name = 'api'
dashboard_name = 'dashboard'
backend_param = 'b'
dashboard_param = 'd'

def try_mkdir(sftp: pysftp.Connection, folder: str):
    try:
        sftp.mkdir(folder)
    except OSError:
        pass

# recursive put function for pysftp to upload a directory windows
def put_r_portable(sftp: pysftp.Connection, localdir: str, remotedir: str):
    for entry in os.listdir(localdir):
        remotepath = remotedir + "/" + entry
        localpath = os.path.join(localdir, entry)
        if not os.path.isfile(localpath):
            try_mkdir(sftp, remotepath)
            put_r_portable(sftp, localpath, remotepath)
        else:
            sftp.put(localpath, remotepath)

def npm_build(folder: str):
    print('  Building ' + folder)
    subprocess.call('npm run build', shell=True, cwd=local_path + '/' + folder)

def install_node_modules(sftp: pysftp.Connection, folder: str):
    print('  Installing node modules')
    sftp.execute('cd ' + remote_path + "/" + folder + ' && npm install')

def upload_folder(sftp: pysftp.Connection, folder: str, target_folder: str = None):
    if target_folder == None:
        target_folder = folder
    print('  Uploading ' + folder + ' to ' + target_folder)
    try_mkdir(sftp, remote_path + '/' + target_folder)
    put_r_portable(sftp, local_path + '/' + folder, remote_path + '/' + target_folder)

def restart_esplant_service(sftp: pysftp.Connection):
    print('  Restarting esplant service')
    sftp.execute('sudo systemctl restart esplant.service')

args = ''.join(sys.argv[1:])

# Accept any host key (still wrong see below)
cnopts = pysftp.CnOpts()
cnopts.hostkeys = None

private_key_path = '~/.ssh/hopping.key'
# check if private key exists
if not os.path.isfile(os.path.expanduser(private_key_path)):
    # set private key to hopping.key for github actions
    private_key_path = 'hopping.key'

with pysftp.Connection('hoppingadventure.com', username='hopping', private_key=private_key_path, cnopts=cnopts) as sftp:
    if backend_param in args:
        print('Deploying ' + backend_name)
        npm_build(backend_name)
        upload_folder(sftp, backend_name + '/dist', backend_name)
        install_node_modules(sftp, backend_name)
        print("Creating data folder if it doesn't exist")
        try_mkdir(sftp, remote_path + '/data')
        print('Restarting esplant service')
        restart_esplant_service(sftp)
    else:
        print('Skipping ' + backend_name + ' deploy,      enable with "' + backend_param + '"')
    
    if dashboard_param in args:
        print('Deploying ' + dashboard_name)
        npm_build(dashboard_name)
        upload_folder(sftp, backend_name + '/' + dashboard_name)
    else:
        print('Skipping ' + dashboard_name + ' deploy, enable with "' + dashboard_param + '"')

print('Done!')